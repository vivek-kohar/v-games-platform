"use client"

interface InventoryProps {
  selectedBlock: string
  selectedWeapon: string
  selectedArmor: string
  onBlockSelect: (block: string) => void
  onWeaponSelect: (weapon: string) => void
  onArmorSelect: (armor: string) => void
}

  const getBlockColorClasses = (blockId: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string, border: string, selectedBorder: string }> = {
      grass: { bg: 'from-green-600 to-green-800', border: 'border-green-600', selectedBorder: 'border-green-400' },
      stone: { bg: 'from-gray-600 to-gray-800', border: 'border-gray-600', selectedBorder: 'border-gray-400' },
      wood: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-600', selectedBorder: 'border-amber-400' },
      dirt: { bg: 'from-yellow-600 to-yellow-800', border: 'border-yellow-600', selectedBorder: 'border-yellow-400' },
      water: { bg: 'from-blue-600 to-blue-800', border: 'border-blue-600', selectedBorder: 'border-blue-400' },
      diamond: { bg: 'from-cyan-600 to-cyan-800', border: 'border-cyan-600', selectedBorder: 'border-cyan-400' },
      gold: { bg: 'from-yellow-500 to-yellow-700', border: 'border-yellow-500', selectedBorder: 'border-yellow-300' },
      iron: { bg: 'from-gray-500 to-gray-700', border: 'border-gray-500', selectedBorder: 'border-gray-300' }
    }
    
    const colors = colorMap[blockId] || colorMap.grass
    return {
      bg: `bg-gradient-to-br ${colors.bg}`,
      border: isSelected ? colors.selectedBorder : colors.border
    }
  }

export default function EnhancedInventory({ 
  selectedBlock, 
  selectedWeapon, 
  selectedArmor,
  onBlockSelect, 
  onWeaponSelect, 
  onArmorSelect 
}: InventoryProps) {
  const blocks = [
    { id: 'grass', name: 'GRASS', emoji: '🌱', color: 'green' },
    { id: 'stone', name: 'STONE', emoji: '🪨', color: 'gray' },
    { id: 'wood', name: 'WOOD', emoji: '🪵', color: 'amber' },
    { id: 'dirt', name: 'DIRT', emoji: '🟫', color: 'yellow' },
    { id: 'water', name: 'WATER', emoji: '💧', color: 'blue' },
    { id: 'diamond', name: 'DIAMOND', emoji: '💎', color: 'cyan' },
    { id: 'gold', name: 'GOLD', emoji: '🟨', color: 'yellow' },
    { id: 'iron', name: 'IRON', emoji: '⬜', color: 'gray' }
  ]

  const weapons = [
    { id: 'none', name: 'FIST', emoji: '✊', damage: 1 },
    { id: 'sword', name: 'SWORD', emoji: '⚔️', damage: 5 },
    { id: 'bow', name: 'BOW', emoji: '🏹', damage: 3 },
    { id: 'axe', name: 'AXE', emoji: '🪓', damage: 4 }
  ]

  const armor = [
    { id: 'none', name: 'NONE', emoji: '👕', protection: 0 },
    { id: 'leather', name: 'LEATHER', emoji: '🦺', protection: 2 },
    { id: 'iron', name: 'IRON', emoji: '🛡️', protection: 5 },
    { id: 'diamond', name: 'DIAMOND', emoji: '💎', protection: 8 }
  ]

  return (
    <div className="fixed top-32 left-4 z-50">
      <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-xl p-4 border-2 border-gray-600 shadow-2xl max-w-xs">
        
        {/* Building Blocks */}
        <div className="mb-4">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="text-lg">🧱</div>
              <div className="text-xs text-white font-bold">BLOCKS</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {blocks.map((block, index) => {
              const colorClasses = getBlockColorClasses(block.id, selectedBlock === block.id)
              return (
                <div key={block.id} className="group relative">
                  <div 
                    className={`inventory-slot ${selectedBlock === block.id ? 'selected' : ''} 
                      ${colorClasses.bg} border-2 ${colorClasses.border}
                      w-12 h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg 
                      hover:scale-105 transition-all duration-200 shadow-lg`}
                    onClick={() => onBlockSelect(block.id)}
                  >
                    <div className="text-lg">{block.emoji}</div>
                  </div>
                  <div className={`absolute -top-1 -right-1 bg-${block.color}-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center`}>
                    {index + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weapons */}
        <div className="mb-4">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="text-lg">⚔️</div>
              <div className="text-xs text-white font-bold">WEAPONS</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {weapons.map((weapon) => (
              <div key={weapon.id} className="group relative">
                <div 
                  className={`inventory-slot ${selectedWeapon === weapon.id ? 'selected border-red-400' : 'border-red-600'} 
                    bg-gradient-to-br from-red-600 to-red-800 border-2
                    w-12 h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg 
                    hover:scale-105 transition-all duration-200 shadow-lg`}
                  onClick={() => onWeaponSelect(weapon.id)}
                >
                  <div className="text-lg">{weapon.emoji}</div>
                </div>
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-red-400">
                  {weapon.damage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Armor */}
        <div className="mb-2">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="text-lg">🛡️</div>
              <div className="text-xs text-white font-bold">ARMOR</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {armor.map((armorItem) => (
              <div key={armorItem.id} className="group relative">
                <div 
                  className={`inventory-slot ${selectedArmor === armorItem.id ? 'selected border-blue-400' : 'border-blue-600'} 
                    bg-gradient-to-br from-blue-600 to-blue-800 border-2
                    w-12 h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg 
                    hover:scale-105 transition-all duration-200 shadow-lg`}
                  onClick={() => onArmorSelect(armorItem.id)}
                >
                  <div className="text-lg">{armorItem.emoji}</div>
                </div>
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-400">
                  {armorItem.protection}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Help */}
        <div className="pt-2 border-t border-gray-600">
          <div className="text-center text-xs text-gray-400 space-y-1">
            <div className="mb-1">🖱️ L:Place/Attack R:Remove</div>
            <div className="text-green-400 font-semibold">{selectedBlock}</div>
            <div className="text-xs text-gray-500 mt-2">
              <div>Blocks: 1-8 keys</div>
              <div>Weapons: Q,W,E,R keys</div>
              <div>Armor: Z,X,C,V keys</div>
              <div className="text-red-400 mt-1">Click mobs to attack!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
