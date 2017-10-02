//Entwicklungsmodus?
const devMode = true;

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;
const ipc = electron.ipcMain
const dialog = electron.dialog;

const path = require('path')
const url = require('url')

const os = require('os');
const storage = require('electron-json-storage');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const openAboutWindow = require('about-window').default;

function createWindow () {
  // Fenster soll bei Maus geöffnet werden
  var mousePos = electron.screen.getCursorScreenPoint();
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mousePos.x, 
    y: mousePos.y,
    minWidth: 340,
    width: 900,
    height: 700,
    minHeight: 500,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    backgroundColor: '#010101',
    show: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  //Fenster erst zeigen, wenn Inhalt fertig
  mainWindow.once( 'page-title-updated', function() {
    mainWindow.show();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  //Menue erstellen
  var menuTemplate = [];

  //About vorne (Mac und andere getrennt)
  if( process.platform === 'darwin' ){
    menuTemplate.push(
      {
        label: 'KIMB-Notes-Desktop',
        submenu: [
          {
            label: 'Über KIMB-Notes-Desktop',
            click: () => openAboutWindow({
              icon_path: path.join(__dirname, 'assets/icons/png/128x128.png'),
              bug_report_url : 'https://github.com/kimbtech/KIMB-Notes-Desktop/issues',
              copyright: 'copyright by KIMB-technologies 2017, distributed under terms of GPLv3',
              homepage: 'https://github.com/kimbtech/KIMB-Notes-Desktop',
              description: 'A desktop application for KIMB-Notes server.',
              license: 'GPL-3.0',
              win_options : electron.screen.getCursorScreenPoint()
            })
          },
          {type: 'separator'},
          {role: 'services', submenu: []},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideothers'},
          {role: 'unhide'},
          {type: 'separator'},
          {
            label: 'Freigaben',
            click: () => freigabenDialog()
          },
          {type: 'separator'},
          {
            label: 'Ausloggen',
            click: () => logUserOut()
          },
          {
            label : 'Beenden',
            role: 'quit'
          }
        ]
      });
    }
    else{
      menuTemplate.push(
        {
          label: 'KIMB-Notes-Desktop',
          submenu: [
            {
              label: 'Über KIMB-Notes-Desktop',
                click: () => openAboutWindow({
                  icon_path: path.join(__dirname, 'assets/icons/png/128x128.png'),
                  bug_report_url : 'https://github.com/kimbtech/KIMB-Notes-Desktop/issues',
                  copyright: 'copyright by KIMB-technologies 2017, distributed under terms of GPLv3',
                  homepage: 'https://github.com/kimbtech/KIMB-Notes-Desktop',
                  description: 'A desktop application for KIMB-Notes server.',
                  license: 'GPL-3.0',
                  win_options : electron.screen.getCursorScreenPoint()
                })
            },
            {type: 'separator'},
            {
              label: 'Freigaben',
              click: () => freigabenDialog()
            },
            {type: 'separator'},
            {
              label: 'Ausloggen',
              click: () => logUserOut()
            },
            {
              label : 'Beenden',
              role: 'quit'
            }
          ]
        });
    }

    //Weiteres Menü (alle OS gleich)
    menuTemplate.push(
      {
        label: 'Bearbeiten',
        submenu: [
          {
            label: 'Rückgängig',
            role: 'undo'
          },
          {
            label: 'Wiederholen',
            role: 'redo'
          },
          {type: 'separator'},
          {
            label: 'Ausschneiden',
            role: 'cut'
          },
          {
            label: 'Kopieren',
            role: 'copy'
          },
          {
            label: 'Einfügen',
            role: 'paste'
          }
        ]
      });

    menuTemplate.push(
      {
        label: 'Fenster',
        submenu: [
          {
             label: 'Neu laden',
             role: 'reload'
          },
          { type: 'separator' },
          {
            label: 'Minimieren',
            role: 'minimize'
          },
          {
            label: 'Schließen',
            role: 'close'
          }
        ]
      });

    //Entwicklungsmenü
    if( devMode ){
      menuTemplate.push(
        {
          label: 'Entwicklung',
          submenu: [
            {role: 'forcereload'},
            {role: 'toggledevtools'}
          ]
        });
    }

  //Menü laden
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//User Ausloggen, Fenster neu starten, wieder nach Login fragen
function logUserOut(){
  //fragen
  dialog.showMessageBox(
    { type: 'info', buttons: ['Ja', 'Nein'], message: 'Wollen Sie sich wiklich ausloggen?' },
    function (buttonIndex) {
      if( buttonIndex === 0 ){
        //Userdaten löschen
        storage.remove('NotesUser', function(error) {
          if( error ){
            throw error;
          }

          //Authcode löschen, dann Fenster neu laden
          mainWindow.webContents.send( 'delete-authcode' );
      });
    }
  });
}

//Userdaten des Users abfragen (werde in Home gesucht und wenn verfügbar geladen)
function askForUserData( event ){
  var userdata = {
    "server" : "",
    "username" : "",
    "userid" : "",
    "authcode" : ""
  };
  var loggedIn = false;

  try{
    //Speicherung als JSON-String unter Schlüssel "NotesUser"
    storage.has( 'NotesUser', function(error, hasIt) {
      if( error ){
        throw error;
      }

      if( hasIt ){
        //Daten lesen
        storage.get( 'NotesUser' , function(error, data) {
          if (error){
            throw error;
          }
          //Daten nehemen
          userdata = data;

          answer( true );

        });
      }
      else{
        answer(false);
      }

    });

    //zurückgeben
    function answer(loggedIn){
      event.sender.send('ask-for-user-data-back', {
        "loggedIn" : loggedIn,
        "userdata" : userdata
      });
    }

  //Fehler fangen.
  } catch( e ) {
    dialog.showErrorBox( 'Kann Userinformationen nicht lesen!' , 'Fehler: "' + e.message + '"' );
  }
}

//Userdaten auf Festplatte im Home des Users sichern
function saveUserData( event, userdata ){
  storage.set('NotesUser', userdata, function(error) {
    if (error){
      dialog.showErrorBox( 'Kann Userinformationen nicht speichern!' , 'Fehler: "' + error.message + '"' );
    }
  });
}

// Messages IPC
ipc.on('ask-for-user-data', askForUserData );
ipc.on('save-user-data', saveUserData );
ipc.on('reload-window', () => { mainWindow.reload(); });

//Freigaben Menübutton
function freigabenDialog(){
  //an das Fenster weitergeben
  mainWindow.webContents.send( 'freigaben-dialog' );
}

