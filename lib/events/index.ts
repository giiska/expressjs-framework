import Concert from './Concert'

export const eventBus:any = {
//   _events: Concert._events
}

eventBus.add = Concert.prototype.on

eventBus.emit = Concert.prototype.trigger