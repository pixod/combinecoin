var db = firebase.firestore();
// this show an informational message:
// toast.info("Here is some information!");


/* -------------------------------------------------------------------------- */
/*                         Check Authentication State                         */
/* -------------------------------------------------------------------------- */
$.LoadingOverlay("show");
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (user != null) {
            // If you want it to redirect automatically uncomment this line
            // redirectTo("landing-page.html")
            // window.location.replace('index.html')
            console.log('Already Signed In!');
            // localStorage.setItem('user', JSON.stringify(user))
            window.location.replace('index.html');
            $.LoadingOverlay("hide");
        }
    } else {
        console.log("Welcome, please fill in the sign up form to proceed.");
        $.LoadingOverlay("hide");
    }
});

const login = () => {
    var email = document.querySelector('.email').value;
    var pwd = document.querySelector('.pwd').value;
    $.LoadingOverlay("show");
    firebase.auth().signInWithEmailAndPassword(email, pwd).then(function (user) {
        localStorage.setItem('user', JSON.stringify(user))
        $.LoadingOverlay("hide");
        console.log("Authenticated successfully with payload:", user);
        Swal.fire(
            'Success',
            'Authentication Successful!',
            'success'
        )
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1200)
    }).catch(function (error) {
        $.LoadingOverlay("hide");
        console.log("Login Failed!", error);
        Swal.fire(
            'Error',
            error.message,
            'error'
        )
    });
}

async function googleLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}


var form = document.getElementById("loginForm");

function handleForm(event) {
    event.preventDefault();
    login();
}
form.addEventListener('submit', handleForm);