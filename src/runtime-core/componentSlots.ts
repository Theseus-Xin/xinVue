export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]
  normalizeObjectSlots(children, instance.slots)
}

function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    if (Object.prototype.hasOwnProperty.call(children, key)) {
      const value = children[key];
      slots[key] = normalizeSlotValue(value)
    }
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}