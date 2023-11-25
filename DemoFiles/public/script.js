let scoopAmount = document.getElementsByClassName('scoopAmount').defaultValue = 1;
let cAmount = document.getElementsByClassName('cAmount').defaultValue = 2;
//let CurrencyType = document.getElementById('currency');
// let scoopAmount;
// let cAmount;

// function getData(form) {
//   var formData = new FormData(form);

//   for (var pair of formData.entries()) {

//     if (pair[0] === "cAmount") {
//       cAmount = pair[1]
//     }
//     else if (pair[0] === "scoopAmount") {
//       scoopAmount = pair[1]
//     }
//     console.log(pair[0] + ": " + pair[1]);
//   }


// }
// document.getElementById("buy-Form").addEventListener("submit", function (e) {
//   e.preventDefault();
//   getData(e.target);
// });



paypal
  .Buttons({
    createOrder: function () {
      return fetch("/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          
          items: [
            {
              id: scoopAmount,
              quantity: cAmount,
            },
          ],
        }),
      })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert("Transaction Completed by: " + details.payer.name.given_name)
      })
    },
  })
  .render("#paypal")
