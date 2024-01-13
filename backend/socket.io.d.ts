import 'socket.io';

declare module 'socket.io' {
  export interface Socket {
    decoded?: any; // You can replace 'any' with a more specific type if needed
  }
}
