*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
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

Jelszo_Valtoztatas
    Open Browser    http://localhost:5173    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[4]
    Click Element    //*[@id="app"]/div/aside/ul/a[4]
    Click Button    //*[@id="app"]/div/main/section/nav/button[2]
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div/div/form/div[3]/input    jelszo321
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div/div/form/div[4]/input    jelszo321
    Click Button    //*[@id="app"]/div/main/section/div/div/form/div[5]/button[2]
    Sleep    2s
    Click Button    //*[@id="app"]/div/aside/div[2]/button
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo321
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[4]
    Click Element    //*[@id="app"]/div/aside/ul/a[4]
    Click Button    //*[@id="app"]/div/main/section/nav/button[2]
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div/div/form/div[3]/input    jelszo123
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div/div/form/div[4]/input    jelszo123
    Click Button    //*[@id="app"]/div/main/section/div/div/form/div[5]/button[2]
    Sleep    2s
    Close Browser
