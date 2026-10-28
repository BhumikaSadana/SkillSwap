const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('session:booked', (s) => {
  console.log(`[EVENT] Session booked: ${s.id} (${s.skill})`);
});
emitter.on('session:completed', (s) => {
  console.log(`[EVENT] Session completed: ${s.id}, credits transferred`);
});

module.exports = emitter;
