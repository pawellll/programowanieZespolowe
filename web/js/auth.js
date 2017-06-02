/**
 * Created by Andrzej on 02.06.2017.
 */

function refreshUserText()
{
    var Username = document.getElementById("username");
    var LoginButton = document.getElementById("login");

    var isLogged = localStorage.getItem("isLogged");
    var username = localStorage.getItem("username");

    if(isLogged == "true")
    {
        Username.innerHTML = username;
        LoginButton.style.visibility = "hidden";
    }
    else
    {
        Username.innerHTML = "";
        LoginButton.style.visibility = "visible";
    }
}

function logout(){
    localStorage.setItem("isLogged", false);
    refreshUserText();
}