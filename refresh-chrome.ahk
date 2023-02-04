#SingleInstance, Force ; skips the dialog box and replaces the old instance automatically
WinActivate, ahk_exe chrome.exe
Send ^+r
Esc::ExitApp
