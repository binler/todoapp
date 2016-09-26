$(function() {
    var socket = io.connect('http://localhost:3000');
    var $window = $(window);
    var roomItem = $('.room_item');
    var room = {
        id: '',
        name: ''
    };

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

    function displayMessage(data) {
        $('.message-area').append('<li>' + data.message + '</br>' + '<span class="time-create">' + data.created_at.toTimeString() + '</span>' + '</li>');
    }

    roomItem.click(function(e) {
        if (!$(this).hasClass('focus')) {
            $('.group__panel .group_list li a').removeClass('focus');
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
    socket.on('chat message', function(data) {
        displayMessage(data);
        loadMessage(500);
    });
    socket.on('switchRoom', function(users, room) {
        $('.message-area').append('<li>' + users.username + ' đã vào phòng!</li>');
    });


});
