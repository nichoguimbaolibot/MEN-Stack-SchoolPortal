//cookie
            function createCookie(name,value,days) {
                if (days) {
                    var date = new Date();
                    //date.setTime(date.getTime()+(days*24*60*60*1000));
                    date.setTime(date.getTime()+(days*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                document.cookie = name+"="+value+expires+"; path=/";
            }

            function readCookie(name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            }

            function eraseCookie(name) {
                createCookie(name,"",-1);
            }

            function checkCookie(){
                
                boolean = readCookie("boolean");
                fullname = readCookie("fullname");
                //PID = readCookie("PID");

                if(boolean == "true"){
                    document.getElementById('login-navbar').innerHTML="";
                    $('#login-navbar').append('<ul class="nav navbar-nav navbar-right"><li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="services.html">Testimony</a></li><li class="dropdown"><a class="dropdown-toggle" type="button" data-toggle="dropdown" >'+fullname+'<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#">View</a></li><hr><li><a href="#" onclick="deleteCookie()">Log out</a></li></ul></li></ul>');
                   
                }
                else
                {   
                    //lert(boolean);
                    //alert(name);
                    ///document.getElementById('user-cookie').innerHTML = "";
                   // $("#admin-cookie").append('<h2>Welcome Mr/Ms.'+fullname+'</h2>');
                   //'Hi, '+fullname+'! <a href="#" onclick="deleteCookie()">Log Out</a>' 
                    $("#login-navbar").append('<ul class="nav navbar-nav navbar-right"><li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="services.html">Testimony</a></li><li><a href="register.html"><span class="glyphicon glyphicon-user" ></span> Sign Up</a></li><li><a href="#" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-log-in"></span> Login</a></li></ul>');
                }
            }