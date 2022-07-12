const socket= io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFromInput = $messageForm.querySelector('input')
const $messageFromButton= $messageForm.querySelector('button')
const $sendLocationButton= document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const {username, room }=Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll =()=>{
    // NEW MES ELEMENT
    const $newMessage= $messages.lastElementChild

    // Height of the new message
    
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    // ht of messages cont

    const containerHeight= $messages.scrollHeight

    //  How far have I scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight

    if (containerHeight-newMessageHeight<=scrollOffset) {
        $messages.scrollTop=$messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
   autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFromButton.setAttribute('disabled','disabled')

    
    const message=e.target.elements.message.value
    socket.emit('sendMessage',(message),(message)=>{
        $messageFromButton.removeAttribute('disabled')
        $messageFromInput.value=''
        $messageFromInput.focus()
        
        
        console.log('message delivered',message)
    })
    
})

$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not Supported ')
        
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Locaton has been shared')
        })

    })

})


socket.emit('join',{username, room},(error)=>{
    if (error) {
        alert(error)
        location.href='/'
    }
})