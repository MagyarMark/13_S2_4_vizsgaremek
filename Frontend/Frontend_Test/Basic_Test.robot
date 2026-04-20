*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
LOGIN_LOGOUT
    Open Browser    http://localhost:5173    Chrome
    Maximize Browser Window
    Wait Until Element Is Visible    //*[@id="landing"]/div/a[1]/button
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Sleep    2s
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/div[2]/button
    Click Button    //*[@id="app"]/div/aside/div[2]/button
    Close Browser

REGISTER
    Open Browser    http://localhost:5173    Chrome
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
