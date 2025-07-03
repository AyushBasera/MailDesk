document.addEventListener('DOMContentLoaded', function() {
  
  document.querySelector('#compose-form').addEventListener('submit',function(event){

    event.preventDefault(); 

    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
  })


  

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-emails-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-emails-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then(emails => {
    console.log(emails);
    //create div for each element
    emails.forEach(singleEmail => {
      newEmail=document.createElement('div');
      newEmail.innerHTML=`
      <h5>${mailbox==='sent' ? 'To' : 'From'}: ${mailbox==='sent' ? singleEmail.recipients.join(', ') : singleEmail.sender}</h5>
      <h6>Subject: ${singleEmail.subject}</h6>
      <p>TimeStamp: ${singleEmail.timestamp}</p>
      `;
     
      newEmail.className='email-summary list-group-item mb-1 border border-dark px-2';

      //back-Ground Color
      if(singleEmail.read==true){
        newEmail.style.backgroundColor='lightgrey';
      }
      else{
        newEmail.style.backgroundColor='white';
      }
      document.querySelector('#emails-view').append(newEmail);

      newEmail.addEventListener('click',() => view_the_mail(singleEmail.id))
    })
  })

  
}

function view_the_mail(id){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-emails-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response=>response.json())
  .then(email=>{
    document.querySelector('#single-emails-view').innerHTML=`
    <div class="border p-3 mb-3 bg-light">
      <p><strong>From:</strong> ${email.sender}</p>
      <p><strong>To:</strong> ${email.recipients}</p>
      <p><strong>Time:</strong> ${email.timestamp}</p>
      <p><strong>Subject:</strong> ${email.subject}</p>
      <hr>
      <p><strong>Body:</strong></p>
      <div class="p-2 border rounded bg-white" style="white-space: pre-wrap;">${email.body}</div>
    </div>
    `;
    // change to read
    if(email.read==false){
      fetch(`/emails/${email.id}`,{
        method:'PUT',
        body:JSON.stringify({
          read:true
        })
      })
    }

    // for archieve/unarchieve
    const butt = document.createElement('button');
    butt.innerHTML = !email.archived ? "archieve" : "unarchieve";
    butt.className = email.archived ? "btn btn-danger" : "btn btn-success";
    document.querySelector('#single-emails-view').append(butt);
    butt.addEventListener('click', function() {
        fetch(`/emails/${email.id}`,{
          method:'PUT',
          body:JSON.stringify({
            archived:(email.archived==true ? false : true)
          })
        })
        .then(()=>{load_mailbox('inbox')})
    });


    // for reply
    const butt2=document.createElement('button');
    butt2.innerHTML = "Reply";
    butt2.className = "btn btn-info";
    document.querySelector('#single-emails-view').append(butt2);
    butt2.addEventListener('click',function() {
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#single-emails-view').style.display = 'none';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      let subject=email.subject;
      if(subject.split(' ',1)[0]!="Re:"){
        subject="Re: "+subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} , ${email.sender} wrote: ${email.body}`;
    })
  })
}