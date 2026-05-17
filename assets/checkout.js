/* Wildhaven Covenant — founding-contribution checkout (real Stripe Elements).
   Flow mirrors FoxLock: server PaymentIntent -> clientSecret -> PaymentElement
   -> confirmPayment. This charges a FOUNDING CONTRIBUTION, not a tax-
   deductible donation; the UI says so loudly. */
(function () {
  'use strict';

  var stripe = null;
  var elements = null;
  var chosenAmount = 0;

  var $ = function (id) { return document.getElementById(id); };
  function show(id) { var e = $(id); if (e) e.style.display = ''; }
  function hide(id) { var e = $(id); if (e) e.style.display = 'none'; }
  function setStatus(t) { var e = $('sb-status'); if (e) e.textContent = t; }

  function money(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // ---- Boot: ask the server whether Stripe is configured ----
  fetch('/api/payment-config', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      if (!cfg.configured || !cfg.publishableKey) {
        hide('step-amount');
        show('step-unconfigured');
        setStatus('Payments: not yet live (pledge by email)');
        return;
      }
      stripe = Stripe(cfg.publishableKey);
      setStatus(cfg.mode === 'live'
        ? 'Payments: live (founding contribution — not tax-deductible)'
        : 'Payments: TEST mode — no real money will move');
      if (cfg.mode === 'test') {
        var banner = document.createElement('div');
        banner.className = 'note';
        banner.style.cssText = 'background:#d7e8ff;border:2px solid #1084d0;';
        banner.innerHTML = '<strong>TEST MODE.</strong> Stripe is in test mode — ' +
          'no real charge occurs. Use card 4242 4242 4242 4242, any future date, any CVC.';
        var host = $('step-amount');
        host.parentNode.insertBefore(banner, host);
      }
    })
    .catch(function () {
      hide('step-amount');
      show('step-unconfigured');
      setStatus('Payments: unavailable');
    });

  // ---- Step 1: amount selection ----
  var grid = $('amount-grid');
  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.amount-opt');
      if (!card) return;
      document.querySelectorAll('.amount-opt').forEach(function (c) {
        c.style.outline = ''; c.classList.remove('pressed');
      });
      card.style.outline = '2px solid #0a6e2e';
      card.classList.add('pressed');
      $('custom-amt').value = card.getAttribute('data-amt');
      var err = $('amount-error'); if (err) err.style.display = 'none';
    });
  }

  function readAmount() {
    var raw = ($('custom-amt').value || '').replace(/[^0-9.]/g, '');
    var v = parseFloat(raw);
    return Number.isFinite(v) ? v : 0;
  }

  var toDetails = $('to-details');
  if (toDetails) {
    toDetails.addEventListener('click', function () {
      var amt = readAmount();
      var err = $('amount-error');
      if (!amt || amt < 1) {
        err.textContent = 'Please choose or enter at least $1.';
        err.style.display = '';
        return;
      }
      if (amt > 50000) {
        err.textContent = 'For contributions over $50,000, email land@wildhavencovenant.org.';
        err.style.display = '';
        return;
      }
      err.style.display = 'none';
      chosenAmount = Math.round(amt * 100) / 100;
      $('amt-echo').textContent = money(chosenAmount);
      hide('step-amount');
      show('step-details');
    });
  }

  var backAmount = $('back-amount');
  if (backAmount) backAmount.addEventListener('click', function () {
    hide('step-details'); show('step-amount');
  });

  // ---- Step 2 -> create PaymentIntent, mount PaymentElement ----
  var toPay = $('to-pay');
  if (toPay) {
    toPay.addEventListener('click', function () {
      var err = $('details-error');
      err.style.display = 'none';
      toPay.disabled = true;
      toPay.textContent = 'Setting up secure payment…';

      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: chosenAmount,
          email: ($('cemail').value || '').trim(),
          name: ($('cname').value || '').trim()
        })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          toPay.disabled = false;
          toPay.textContent = 'Continue to secure payment »';
          if (!res.ok || !res.j.clientSecret) {
            err.textContent = res.j.error || 'Could not start payment. Please try again.';
            err.style.display = '';
            return;
          }
          elements = stripe.elements({
            clientSecret: res.j.clientSecret,
            appearance: {
              theme: 'flat',
              variables: {
                colorPrimary: '#0a6e2e',
                colorBackground: '#ffffff',
                fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
                fontSizeBase: '13px',
                borderRadius: '0px'
              }
            }
          });
          var pe = elements.create('payment', { layout: 'tabs' });
          pe.mount('#payment-element');
          $('pay-amt').textContent = money(chosenAmount);
          hide('step-details');
          show('step-pay');
        })
        .catch(function () {
          toPay.disabled = false;
          toPay.textContent = 'Continue to secure payment »';
          err.textContent = 'Network error. Please try again.';
          err.style.display = '';
        });
    });
  }

  var backDetails = $('back-details');
  if (backDetails) backDetails.addEventListener('click', function () {
    hide('step-pay'); show('step-details');
  });

  // ---- Step 3: confirm payment ----
  var form = $('payment-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('submit-pay');
      var msg = $('pay-message');
      btn.disabled = true;
      btn.textContent = 'Processing…';
      msg.style.color = '#555';
      msg.textContent = 'Contacting Stripe securely…';

      stripe.confirmPayment({
        elements: elements,
        confirmParams: {
          return_url: window.location.origin + '/success.html'
        }
      }).then(function (result) {
        // Only reached if there's an immediate error; otherwise Stripe redirects.
        btn.disabled = false;
        btn.textContent = 'Contribute ' + money(chosenAmount);
        if (result.error) {
          msg.style.color = '#b00';
          msg.textContent = result.error.message || 'Payment could not be completed.';
        }
      });
    });
  }
})();
