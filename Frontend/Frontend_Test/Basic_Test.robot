*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
LOGIN_LOGOUT
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/header/div[2]/div[2]/div[3]/button
    Click Button    //*[@id="app"]/div/header/div[2]/div[2]/div[3]/button
    Close Browser

REGISTER
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[2]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    aut_test
    SeleniumLibrary.Input Text    //*[@id="fullName"]    Autómata Tesztelés
    SeleniumLibrary.input Text    //*[@id="email"]    test@gmail.com
    SeleniumLibrary.Input Password    //*[@id="password"]    auttest
    SeleniumLibrary.Input Password    //*[@id="confirmPassword"]    auttest
    Scroll Element Into View    //*[@id="app"]/main/div/form/button
    Click Element    //*[@id="app"]/main/div/form/div[6]/div/label[1]/input
    Click Element    //*[@id="app"]/main/div/form/div[7]/label/input
    Click Button    //*[@id="app"]/main/div/form/button
    Close Browser

DEAKTIVALAS
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    aut_test
    SeleniumLibrary.Input Password    //*[@id="password"]    auttest
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[5]
    Click Element    //*[@id="app"]/div/aside/ul/a[5]
    Click Button    //*[@id="app"]/div/main/section/nav/button[2]
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div/div/form/button
    Click Button    //*[@id="app"]/div/main/section/div/div/form/button
    Sleep    1s
    Handle Alert    ACCEPT
    Sleep    1s
    Handle Alert    ACCEPT
    Sleep    2s
    Close Browser
