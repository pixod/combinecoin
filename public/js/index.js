var userData, fetchedUser = {};
var db = '';
var user = '';

firebase.auth().onAuthStateChanged(function (userAuth) {
    db = firebase.firestore();
    user = userAuth;
    if (userAuth) {
        // alert('okay!')
        console.log(userAuth);
        // userAuth.providerData.forEach(function (profile) {
        //     console.log("Sign-in provider: " + profile.providerId);
        //     console.log("  Provider-specific UID: " + profile.uid);
        //     console.log("  Name: " + profile.displayName);
        //     console.log("  Email: " + profile.email);
        //     console.log("  Photo URL: " + profile.photoURL);
        //   });
        getUser();
    } else {
        console.log(userAuth);
        Swal.fire({
            title: `Kindly Log In First`,
            confirmButtonText: 'Okay',
            icon: 'question'
        });
        window.location.replace('login.html')
    }
}); 

function balanceCheck() {
    Swal.fire({
        title: `${userData.balance} C₵`,
        confirmButtonText: 'Thanks',
        icon: 'question'
    });
}

async function sendMoney() {
    var {
        value: formValues
    } = await Swal.fire({
        title: 'Send Money',
        html: '<input id="swal-input1" placeholder="Username" class="swal2-input">' +
            '<input id="swal-input2"  placeholder="Amount C₵" type="tel" class="swal2-input">' +
            '<input id="swal-input3"  placeholder="Description"  class="swal2-input">',
        focusConfirm: false,
        confirmButtonText: 'Continue',
        preConfirm: function () {
            return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value,
                document.getElementById('swal-input3').value
            ]
        }
    })
    if (formValues) {
        $.LoadingOverlay("show");
        if (formValues[1].length > 0 && formValues[2].length >= 4) {
            if (parseInt(formValues[1]) <= userData.balance) {
                var noReceiver = await getReceiver(formValues[0]);
                if (!noReceiver) {
                    deductAndCredit(userData, fetchedUser, parseInt(formValues[1]), formValues[2], 'payout')
                    console.log(fetchedUser);
                } else {
                    $.LoadingOverlay("hide");
                    Swal.fire(
                        'Error',
                        "User doesn't exist",
                        'error'
                    )
                }
            } else {
                $.LoadingOverlay("hide");
                Swal.fire(
                    'Insufficient Balance',
                    "You don't have enough in your balance to send that amount!",
                    'error'
                )
            }
        } else {
            $.LoadingOverlay("hide");
            Swal.fire(
                'Error',
                "Invalid Amount or Description",
                'error'
            )
        }
        // Swal.fire(JSON.stringify(formValues))
    }
}



/* -------------------------------------------------------------------------- */
/*                  Deduct Sender Balance and Credit Receiver                 */
/* -------------------------------------------------------------------------- */

function deductAndCredit(sender, receiver, amount, description, type) {
    var neg = amount * -1;
    db.collection('users').doc(sender.userId).update({
        balance: firebase.firestore.FieldValue.increment(neg)
    }).then(function () {
        db.collection('users').doc(receiver.userId).update({
            balance: firebase.firestore.FieldValue.increment(amount)
        }).then(function () {
            addTransactionObject(sender, receiver, amount, description, type)
        }).catch(function (err) {
            $.LoadingOverlay("hide");
            Swal.fire(
                'Error',
                err.message,
                'error'
            )
        })
    }).catch(function (err) {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Error',
            err.message,
            'error'
        )
    });
} 

function addTransactionObject(sender, receiver, amount, description, type) {
    var obj = {
        senderId: sender.userId,
        receiverId: receiver.userId,
        receiverUserName: receiver.username,
        senderUserName: sender.username,
        amount: amount,
        description: description,
        completed: true,
        type: type,
        parties: [sender.userId, receiver.userId]
    }
    var id = db.collection('transactions').doc().id;
    obj.transactionId = id;
    db.collection('transactions').doc(id).set(obj).then(function () {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Transfer Successful',
            `The amount has been transferred to ${fetchedUser.username}'s account.`,
            'success'
        )
    }).catch(function (err) {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Error',
            err.message,
            'error'
        )
    })
}

function coinRequest(sender, receiver, amount, description, type) {
    var obj = {
        senderId: sender.userId,
        receiverId: receiver.userId,
        receiverUserName: receiver.username,
        senderUserName: sender.username,
        amount: amount,
        description: description,
        completed: false,
        type: type,
        parties: [sender.userId, receiver.userId]
    }
    var id = db.collection('transactions').doc().id;
    obj.transactionId = id; 
    db.collection('transactions').doc(id).set(obj).then(function () {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Request Sent',
            `Your request has been sent to ${fetchedUser.username} successfully!`,
            'success'
        )
    }).catch(function (err) {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Error',
            err.message,
            'error'
        )
    })
}

async function requestMoney() {
    var {
        value: formValues
    } = await Swal.fire({
        title: 'From Who?',
        html: '<input id="swal-input1" placeholder="Username" class="swal2-input">' +
            '<input id="swal-input2"  placeholder="Amount C₵" type="tel" class="swal2-input">',
        focusConfirm: false,
        confirmButtonText: 'Continue',
        preConfirm: function () {
            return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value
            ]
        }
    })
    if (formValues) {
        $.LoadingOverlay("show");
        var noReceiver = await getReceiver(formValues[0]);
        if (!noReceiver) {
            coinRequest(fetchedUser, userData, parseInt(formValues[1]), 'Coin Request', 'request')
            console.log(fetchedUser);
        } else {
            $.LoadingOverlay("hide");
            Swal.fire(
                'Error',
                "User doesn't exist",
                'error'
            )
        }
        // Swal.fire(JSON.stringify(formValues));
    }
}

// /* ------------------------------------ - ----------------------------------- */

async function getUser() {

    $.LoadingOverlay("show");
    if (user) {
        db.collection("users").doc(user.uid).get().then(function (doc) {
            $.LoadingOverlay("hide");
            if (doc.exists) {
                console.log("Document data:", doc.data());
                userData = doc.data();
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function (error) {
            $.LoadingOverlay("hide");
            console.log("Error getting document:", error);
        });

    } else {
        Swal.fire(
            'Error',
            'Kindly Log In First.',
            'error'
        ).then(function () {
            window.location.replace('login.html');
        });
    }

}



// /* ------------------------------------ - ----------------------------------- */


async function getReceiver(uname) {
    var docSnap = await db.collection('users').where('username', '==', uname).get();
    docSnap.forEach(function (doc) {
        if (doc.data()) {
            fetchedUser = doc.data();
        } else {
            console.log('Snapshot Empty!')
        }
    });
    return docSnap.empty;
}

// function numberWithCommas(x) {
//     return x.toString().replace("^/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/$", ",");
// }

function redirectTo(url) {
    window.location.replace(url)
}

// $(document).ready(async function ($) {
//     // When an link is clicked, display the loader
//     $(".send-btn").on('touchstart click', function () {
//         event.preventDefault();
//         sendMoney();
//     });
// }); 


function logOut() {
    firebase.auth().signOut().then(() => {
        window.location.replace('login.html')
    })
}