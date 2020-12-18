// var toast = new Toasty();
var db = firebase.firestore();
// this show an informational message:
// toast.info("Here is some information!");


/* -------------------------------------------------------------------------- */
/*                         Check Authentication State                         */
/* -------------------------------------------------------------------------- */

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (user != null) {
            // If you want it to redirect automatically uncomment this line
            // redirectTo("landing-page.html")
            // window.location.replace('index.html')
            console.log('Already Signed In!');
            localStorage.setItem('user', JSON.stringify(user))
        }
    } else {
        console.log("Welcome, please fill in the sign up form to proceed.")
    }
});

const signUp = async () => {
    // Show full page LoadingOverlay
    $.LoadingOverlay("show");
    var email = document.querySelector('.email').value;
    var pwd = document.querySelector('.pwd').value;
    var fname = document.querySelector('.fname').value;
    var lname = document.querySelector('.lname').value;
    var uname = document.querySelector('.username').value;
    var btn = document.querySelector('.signup-btn');
    btn.disabled = true;
    const userNameUnique = await userNameCheck(uname);
    if (userNameUnique) {
        firebase.auth().createUserWithEmailAndPassword(email, pwd).then(function (newUserCredential) {
            db.collection("users").doc(newUserCredential.user.uid).set({
                firstName: fname,
                lastName: lname,
                username: uname,
                fullName: `${fname} ${lname}`,
                email: email,
                pwd: pwd,
                balance: 0,
                userId: newUserCredential.user.uid
            }).then(() => {
                $.LoadingOverlay("hide");
                Swal.fire(
                    'Success',
                    'Account Created Successfully!',
                    'success'
                )
                setTimeout(function () {
                    window.location.replace('index.html');
                }, 1500);
            }).catch((err) => {
                $.LoadingOverlay("hide");
                btn.disabled = false;
                Swal.fire(
                    'Account Creation Error',
                    err.message,
                    'error'
                )
                throw new Error(err);
            });
        }).catch(function (error) {
            $.LoadingOverlay("hide");
            btn.disabled = false;
            console.log("Login Failed!", error);
            Swal.fire(
                'Error',
                error.message,
                'error'
            )
        });
    } else {
        $.LoadingOverlay("hide");
        btn.disabled = false;
        Swal.fire(
            'Error',
            'Username already exists!',
            'error'
        )
    }
}

const userNameCheck = async (uname) => {
    const doc = await db.collection('users').where('username', '==', uname).get();
    return doc.empty;
}

var form = document.getElementById("signupForm");

function handleForm(event) {
    event.preventDefault();
    signUp();
}

form.addEventListener('submit', handleForm);