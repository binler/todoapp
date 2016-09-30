$(function() {
    var socket = io.connect('http://localhost:3000');
    var $window = $(window);
    var roomItem = $('.room_item');
    var room = {
        id: '',
        name: ''
    };
    var a = [];

    /**
     * Scroll to bottom when submit message to see newest message
     * @param  speed : Speed to scroll
     * @return void
     */
    function loadMessage(speed) {
        var s = speed || 500;
        if ($(".chat-content").length) {
            var h = $(".chat-content").get(0).scrollHeight;
            $(".chat-content").animate({
                scrollTop: h
            }, s);
        }
    }

    function displayMessage(data, users) {
        var username = (data._creator) ? data._creator.username : users.username;
        $('.message-area').append('<li>' + '<span class="user-info">' + username + '</span></br>' + data.message + '</br>' + '<span class="time-create">' + data.created_at + '</span>' + '</li>');
    }

    function displayUsers(alluser) {
        var view = '<li><a class="user_item" data-id="'+alluser._id+'">' + alluser.username + '</a></li>';
        $('.users_list').append(view);
    }

    socket.on('allusers', function(alluser) {
        for (var i = 0; i < alluser.length; i++) {
            displayUsers(alluser[i]);
        }
    });

    socket.on('connect', function(){
      socket.emit('load user', {check : false});
    });

    socket.on('check online', function(useronline) {
        var userItem = $('.user_item');
        userItem.each(function(index) {
            var idUser = $(this).attr('data-id');
            if (useronline.indexOf(idUser) !== -1) {
                $(this).addClass('online');
            } else {
                $(this).removeClass('online');
            }
        });
    });


    roomItem.click(function(e) {
        if (!$(this).hasClass('focus')) {
            $('.gdit__panel .gdit_list li a').removeClass('focus');
            $(this).addClass('focus');
            room.id = $(this).parent().attr('data-id');
            room.name = $(this).text();
            $('.chat-content .message-area li').remove();
            socket.emit('switchRoom', room);
        } else {
            e.preventDefault();
        }
    });

    $window.keydown(function(event) {
        if (event.which === 13) {
            var inputMessage = $('#chat-input-textarea').val();
            if (inputMessage) {
                $('#chat-input-textarea').val('');
                socket.emit('chat message', {
                    message: inputMessage,
                    created_at: new Date(),
                });
            }
        }
    });
    socket.on('load messages', function(room, messages) {
        for (var i = 0; i < messages.length; i++) {
            displayMessage(messages[i]);
        }
        loadMessage(100);
    });

    socket.on('chat message', function(data, users) {
        displayMessage(data, users);
        loadMessage(500);
    });
    socket.on('switchRoom', function(users, room) {
        $('.message-area').append('<li>' + users.username + ' đã vào phòng!</li>');
    });



});
