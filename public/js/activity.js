var userData = {};
var db = firebase.firestore();
var user = '';
var transactions = [];


firebase.auth().onAuthStateChanged(function (userAuth) {
    db = firebase.firestore();
    user = userAuth;
    if (userAuth) {
        // alert('okay!')
        console.log(userAuth);
        // getUser();
        app.getData();
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

function getUser() {
    $.LoadingOverlay("show");
    db.collection("users").doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            userData = doc.data();
            getUserTransactions();
        } else {
            $.LoadingOverlay("hide");
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        $.LoadingOverlay("hide");
        console.log("Error getting document:", error);
    });
};

const getUserTransactions = () => {
    db.collection('transactions').where('parties', 'array-contains-any', [userData.userId]).get().then((querySnapshot) => {
        $.LoadingOverlay("hide");
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            transactions.push(doc.data());
        });
        console.log(transactions);
    }).catch((err) => {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Error',
            err.message,
            'error'
        )
    });
}

const sendMoney = (senderId, receiverId, amount, id) => {
    if (userData.balance >= parseInt(amount)) {
        $.LoadingOverlay("show");
        const neg = amount * -1;
        db.collection('users').doc(senderId).update({
            balance: firebase.firestore.FieldValue.increment(neg)
        }).then(() => {
            db.collection('users').doc(receiverId).update({
                balance: firebase.firestore.FieldValue.increment(amount)
            }).then(() => {
                updateTransactionObject(id)
            }).catch((err) => {
                $.LoadingOverlay("hide");
                Swal.fire(
                    'Error',
                    err.message,
                    'error'
                )
            });
        }).catch((err) => {
            $.LoadingOverlay("hide");
            Swal.fire(
                'Error',
                err.message,
                'error'
            )
        });
    } else {
        Swal.fire(
            'Insufficient Balance',
            `You don't have enough to send that amount sorry.`,
            'error'
        )
    }
}

const updateTransactionObject = (transactionId) => {
    db.collection('transactions').doc(transactionId).update({
        completed: true
    }).then(() => {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Transfer Successful',
            `The amount has been transferred successfuly.`,
            'success'
        )
        setTimeout(() => {
            window.location.reload();
        }, 1500)
    }).catch((err) => {
        $.LoadingOverlay("hide");
        Swal.fire(
            'Error',
            err.message,
            'error'
        )
    })
}

var app = new Vue({
    el: '#app',
    data: {
        transactions: transactions,
        userObject: userData,
        open: ''
    },
    methods: {
        getData: function () {
            $.LoadingOverlay("show");
            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    userData = doc.data();
                    this.userObject = doc.data();
                    getUserTransactions();
                } else {
                    $.LoadingOverlay("hide");
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                $.LoadingOverlay("hide");
                console.log("Error getting document:", error);
            });
        },
        send: function (event, senderId, receiverId, amount, id) {
            // `this` inside methods points to the Vue instance
            sendMoney(senderId, receiverId, amount, id)
        },
        logout: function () {
            // `this` inside methods points to the Vue instance
            firebase.auth().signOut().then(() => {
                window.location.replace('login.html')
            })
        }
    }
});