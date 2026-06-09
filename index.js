var x=";M7#@F!9qL$";
const correctPin = x;

    function checkPin() {
      const inputPin = document.getElementById("pinInput").value;
      if(inputPin === correctPin){
        document.getElementById("studentTable").style.display = "table";
        document.getElementById("pinSection").style.display = "none";
      } else {
        document.getElementById("error").style.display = "block";
      }
    }