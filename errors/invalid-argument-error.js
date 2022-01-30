function InvalidArgumentError(code, message) {
    this.properties = {
        code: code || 500,
        message: message
    };
}

module.exports = InvalidArgumentError;