*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
Uzenet_KULDES_FOGADAS
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[3]
    Click Element    //*[@id="app"]/div/aside/ul/a[3]
    Click Element    //*[@id="app"]/div/main/section/div[2]/div[1]/div[4]/select
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div[2]/div[1]/div[4]/select/option[2]
    Click Element    //*[@id="app"]/div/main/section/div[2]/div[1]/div[4]/select/option[2]
    Click Button    //*[@id="app"]/div/main/section/div[2]/div[1]/div[4]/button
    Click Element    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/input
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/input    Szia Éva, hogy vagy?
    Click Button    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/button
    Sleep    3s
    Click Button    //*[@id="app"]/div/main/header/div[2]/div/div[3]/button
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_eva
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo456
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[3]
    Click Element    //*[@id="app"]/div/aside/ul/a[3]
    Sleep    1s
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/input
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/input    Szia János, rossz kedvemben vagyok.
    Click Button    //*[@id="app"]/div/main/section/div[2]/div[2]/div[3]/button
    Sleep    3s
    Close Browser
