// Global key for canMakepayment cache.
const canMakePaymentCache = 'canMakePaymentCache';

/**
 * Check whether can make payment with Google Pay or not. It will check session storage
 * cache first and use the cache directly if it exists. Otherwise, it will call
 * canMakePayment method from PaymentRequest object and return the result, the
 * result will also be stored in the session storage cache for future usage.
 *
 * @private
 * @param {PaymentRequest} request The payment request object.
 * @return {Promise} a promise containing the result of whether can make payment.
 */
function checkCanMakePayment(request) {
  // Check canMakePayment cache, use cache result directly if it exists.
  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

  // If canMakePayment() isn't available, default to assume the method is
  // supported.
  var canMakePaymentPromise = Promise.resolve(true);

  // Feature detect canMakePayment().
  if (request.canMakePayment) {
    canMakePaymentPromise = request.canMakePayment();
  }

  return canMakePaymentPromise
      .then((result) => {
        // Store the result in cache for future usage.
        sessionStorage[canMakePaymentCache] = result;
        return result;
      })
      .catch((err) => {
        console.log('Error calling canMakePayment: ' + err);
      });
}