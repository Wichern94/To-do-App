export class ToastManager {
    static success(msg) {
        Toastify({
          text: msg,
          duration: 2000,
          close: true,
          gravity:'bottom',
          position: 'left',
          stopOnFocus:true,
          style: {
            background: '#5CCBA0',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: '500',
            left:'30%',
            transform: 'translateX(-20%)',
            width: 'fit-content'
          },  
        }).showToast();
    }

    static info(msg) {
        Toastify({
          text: msg,
          duration: 2000,
          close: true,
          gravity:'bottom',
          position: 'left',
          stopOnFocus:true,
          style: {
            background: '#6BCDCE',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: '500',
            left:'30%',
            transform: 'translateX(-20%)',
            width: 'fit-content'
          },  
        }).showToast();
    }

    static error(msg) {
        Toastify({
          text: msg,
          duration: 2000,
          close: true,
          gravity:'top',
          position: 'left',
          stopOnFocus:true,
          style: {
            background: '#EF6C67',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: '500',
            left:'50%',
            transform: 'translateX(-50%)',
            width: 'fit-content'
          },  
        }).showToast();
    }

    
}