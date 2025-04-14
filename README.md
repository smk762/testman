## Stack

https://github.com/postmanlabs/newman
https://github.com/reown-com/web-examples
https://github.com/KomodoPlatform/komodefi-wasm-rpc
https://github.com/KomodoPlatform/komodo-defi-framework


## Notes

https://chatgpt.com/share/67c6ba58-f198-800d-8176-0bd9e087594c

Flowchart/matrix for test flows:
- device/opsys (cover all libs/binaries)
- hd/non-hd
- v1/v2 trading proto
- coin activation method (where a coin can be activated via more than one method)
- Hardware wallet (cant completely automate, must be done under supervision with some manual steps)
- Walletconnect/keplr/metamask (cant completely automate, must be done under supervision with some manual steps)

- discrete methods (test everything that does not need a sequence)
- "user story" methods: where a sequence of rpcs is required as preamble to testing a method with prerequisite steps.

- test for success and expected fails. Test all fail conditions return an actionable error message

