document.addEventListener('DOMContentLoaded', () => {
    const inviteBtn = document.querySelector('.invite-btn');
    const navButtons = document.querySelectorAll('nav button');
    const controlButtons = document.querySelectorAll('.control-btn');

    inviteBtn.addEventListener('click', () => {
        alert('Invite functionality not implemented in this demo.');
    });

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('end-call')) {
                alert('Call ended. This is a demo.');
            } else {
                button.classList.toggle('active');
            }
        });
    });
});
