const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400); // Umumnya InvariantError mengarah ke Bad Request
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;