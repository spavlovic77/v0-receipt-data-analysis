// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title KreditToken
 * @dev ERC20 token that mints KREDIT tokens based on receipt scanning
 * Only receipts signed by the authorized app signer can be minted
 * Each receipt can only be minted once
 */
contract KreditToken is ERC20, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Authorized signer address (app's public key)
    address public authorizedSigner;

    // Mapping to track which receipts have been minted
    mapping(string => bool) public mintedReceipts;

    // Events
    event ReceiptMinted(
        address indexed user,
        string receiptId,
        uint256 amount,
        uint256 timestamp
    );
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(
        address _authorizedSigner
    ) ERC20("KREDIT Token", "KREDIT") Ownable(msg.sender) {
        require(_authorizedSigner != address(0), "Invalid signer address");
        authorizedSigner = _authorizedSigner;
    }

    /**
     * @dev Mint KREDIT tokens for a scanned receipt
     * @param receiptId The unique receipt ID
     * @param name User's first name
     * @param surname User's last name
     * @param birthNumber User's birth number
     * @param dic Merchant's tax ID
     * @param amount Amount to mint (in wei - smallest unit)
     * @param signature Signature from the authorized signer
     */
    function mintFromReceipt(
        string memory receiptId,
        string memory name,
        string memory surname,
        string memory birthNumber,
        string memory dic,
        uint256 amount,
        bytes memory signature
    ) external {
        // Check if receipt has already been minted
        require(!mintedReceipts[receiptId], "Receipt already minted");

        // Construct the message that should have been signed
        // Format: {receiptId}:{name}:{surname}:{birthNumber}:{dic}:{amount}
        bytes32 messageHash = keccak256(
            abi.encodePacked(receiptId, ":", name, ":", surname, ":", birthNumber, ":", dic, ":", _toString(amount))
        );

        // Convert to Ethereum signed message hash
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover the signer from the signature
        address recoveredSigner = ethSignedMessageHash.recover(signature);

        // Verify the signer is authorized
        require(
            recoveredSigner == authorizedSigner,
            "Invalid signature: not signed by authorized signer"
        );

        // Mark receipt as minted
        mintedReceipts[receiptId] = true;

        // Mint tokens to the caller
        _mint(msg.sender, amount);

        // Emit event
        emit ReceiptMinted(msg.sender, receiptId, amount, block.timestamp);
    }

    /**
     * @dev Check if a receipt has been minted
     * @param receiptId The receipt ID to check
     * @return bool True if minted, false otherwise
     */
    function isReceiptMinted(string memory receiptId) external view returns (bool) {
        return mintedReceipts[receiptId];
    }

    /**
     * @dev Update the authorized signer address
     * @param newSigner The new signer address
     */
    function updateAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        address oldSigner = authorizedSigner;
        authorizedSigner = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    /**
     * @dev Convert uint256 to string
     * @param value The uint256 value to convert
     * @return string The string representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
