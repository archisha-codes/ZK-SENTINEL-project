// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZKCertificateRegistry
 * @dev Stores Zero-Knowledge financial certificates on Polygon Amoy Testnet without exposing raw PII or balances.
 */
contract ZKCertificateRegistry {
    struct Certificate {
        bytes32 certificateId;
        bytes32 commitment;
        bytes32 proofHash;
        string policyVersion;
        uint256 timestamp;
        address issuer;
        bool isRevoked;
    }

    mapping(bytes32 => Certificate) public certificates;
    address public owner;

    event CertificateRegistered(
        bytes32 indexed certificateId,
        bytes32 indexed commitment,
        bytes32 proofHash,
        string policyVersion,
        address indexed issuer
    );

    event CertificateRevoked(bytes32 indexed certificateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerCertificate(
        bytes32 _certificateId,
        bytes32 _commitment,
        bytes32 _proofHash,
        string calldata _policyVersion
    ) external returns (bool) {
        require(certificates[_certificateId].timestamp == 0, "Certificate already registered");

        certificates[_certificateId] = Certificate({
            certificateId: _certificateId,
            commitment: _commitment,
            proofHash: _proofHash,
            policyVersion: _policyVersion,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isRevoked: false
        });

        emit CertificateRegistered(_certificateId, _commitment, _proofHash, _policyVersion, msg.sender);
        return true;
    }

    function revokeCertificate(bytes32 _certificateId) external onlyOwner {
        require(certificates[_certificateId].timestamp > 0, "Certificate does not exist");
        certificates[_certificateId].isRevoked = true;
        emit CertificateRevoked(_certificateId);
    }

    function verifyCertificate(bytes32 _certificateId) external view returns (
        bool isValid,
        bytes32 commitment,
        bytes32 proofHash,
        string memory policyVersion,
        address issuer,
        uint256 timestamp
    ) {
        Certificate memory cert = certificates[_certificateId];
        if (cert.timestamp == 0 || cert.isRevoked) {
            return (false, bytes32(0), bytes32(0), "", address(0), 0);
        }
        return (true, cert.commitment, cert.proofHash, cert.policyVersion, cert.issuer, cert.timestamp);
    }
}
