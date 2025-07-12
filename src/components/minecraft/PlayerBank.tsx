"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Coins, Pickaxe, Shield, Sword, Gem, Package, ArrowUp, ArrowDown } from 'lucide-react'

interface BankItem {
  id: string
  name: string
  type: 'resource' | 'weapon' | 'armor' | 'tool'
  quantity: number
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  value: number
}

interface PlayerBankProps {
  isOpen: boolean
  onClose: () => void
  onDepositItem: (item: BankItem) => void
  onWithdrawItem: (itemId: string, quantity: number) => void
  bankItems: BankItem[]
  playerInventory: BankItem[]
}

const rarityColors = {
  common: 'text-gray-400 border-gray-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400'
}

const rarityBg = {
  common: 'bg-gray-400/10',
  rare: 'bg-blue-400/10',
  epic: 'bg-purple-400/10',
  legendary: 'bg-yellow-400/10'
}

export function PlayerBank({ 
  isOpen, 
  onClose, 
  onDepositItem, 
  onWithdrawItem, 
  bankItems, 
  playerInventory 
}: PlayerBankProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'inventory'>('bank')
  const [selectedItem, setSelectedItem] = useState<BankItem | null>(null)
  const [transferAmount, setTransferAmount] = useState(1)

  if (!isOpen) return null

  const handleDeposit = (item: BankItem) => {
    const amount = Math.min(transferAmount, item.quantity)
    if (amount > 0) {
      onDepositItem({ ...item, quantity: amount })
      setTransferAmount(1)
    }
  }

  const handleWithdraw = (item: BankItem) => {
    const amount = Math.min(transferAmount, item.quantity)
    if (amount > 0) {
      onWithdrawItem(item.id, amount)
      setTransferAmount(1)
    }
  }

  const getTotalValue = (items: BankItem[]) => {
    return items.reduce((total, item) => total + (item.value * item.quantity), 0)
  }

  const getItemsByType = (items: BankItem[], type: string) => {
    return items.filter(item => item.type === type)
  }

  const renderItemGrid = (items: BankItem[], isBank: boolean) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{isBank ? 'Bank is empty' : 'Inventory is empty'}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`
              relative p-2 rounded-lg border cursor-pointer transition-all duration-200
              ${rarityColors[item.rarity]} ${rarityBg[item.rarity]}
              hover:scale-105 hover:shadow-lg
              ${selectedItem?.id === item.id ? 'ring-2 ring-cyan-400' : ''}
            `}
            onClick={() => setSelectedItem(item)}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium truncate">{item.name}</div>
              <div className="text-xs opacity-75">{item.quantity}</div>
            </div>
            {item.quantity > 99 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                99+
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl h-[600px] glass border-white/20 bg-gray-900/90 rounded-lg">
        <div className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Coins className="h-6 w-6 text-yellow-400" />
            <h2 className="text-white text-xl font-bold">Player Bank</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col p-6 pt-0">
          {/* Bank Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-2xl font-bold">
                {getTotalValue(bankItems)}
              </div>
              <div className="text-xs text-gray-400">Bank Value</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-cyan-400 text-2xl font-bold">
                {bankItems.length}
              </div>
              <div className="text-xs text-gray-400">Items Stored</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-green-400 text-2xl font-bold">
                {playerInventory.length}
              </div>
              <div className="text-xs text-gray-400">In Inventory</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4">
            <Button
              variant={activeTab === 'bank' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('bank')}
              className={activeTab === 'bank' ? 'bg-cyan-500 text-white' : 'text-gray-400'}
            >
              <Coins className="h-4 w-4 mr-2" />
              Bank Storage
            </Button>
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('inventory')}
              className={activeTab === 'inventory' ? 'bg-cyan-500 text-white' : 'text-gray-400'}
            >
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
          </div>

          <div className="flex-1 flex gap-4">
            {/* Main Content Area */}
            <div className="flex-1">
              {activeTab === 'bank' ? (
                <div>
                  <h3 className="text-white font-medium mb-3">Bank Storage</h3>
                  {renderItemGrid(bankItems, true)}
                </div>
              ) : (
                <div>
                  <h3 className="text-white font-medium mb-3">Your Inventory</h3>
                  {renderItemGrid(playerInventory, false)}
                </div>
              )}
            </div>

            {/* Item Details & Transfer Panel */}
            {selectedItem && (
              <div className="w-80 glass rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{selectedItem.icon}</div>
                  <h4 className={`font-bold ${rarityColors[selectedItem.rarity].split(' ')[0]}`}>
                    {selectedItem.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{selectedItem.description}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white">{selectedItem.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-yellow-400">{selectedItem.value} coins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rarity:</span>
                    <span className={rarityColors[selectedItem.rarity].split(' ')[0]}>
                      {selectedItem.rarity}
                    </span>
                  </div>
                </div>

                {/* Transfer Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Transfer Amount</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTransferAmount(Math.max(1, transferAmount - 1))}
                        className="w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        min="1"
                        max={selectedItem.quantity}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(Math.max(1, Math.min(selectedItem.quantity, parseInt(e.target.value) || 1)))}
                        className="flex-1 bg-gray-800 text-white text-center rounded px-2 py-1 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTransferAmount(Math.min(selectedItem.quantity, transferAmount + 1))}
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTransferAmount(selectedItem.quantity)}
                      className="w-full mt-1 text-xs text-gray-400"
                    >
                      Max ({selectedItem.quantity})
                    </Button>
                  </div>

                  {/* Transfer Buttons */}
                  {activeTab === 'inventory' ? (
                    <Button
                      onClick={() => handleDeposit(selectedItem)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={transferAmount <= 0}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Deposit to Bank
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleWithdraw(selectedItem)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={transferAmount <= 0}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Withdraw to Inventory
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
