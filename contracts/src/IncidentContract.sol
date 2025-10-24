// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IncidentManager {

    // Contract owner (deployer)
    address public owner;

    // Struct to store incident data
    struct Incident {
        uint id;
        string description;
        address reportedBy;
        uint256 timestamp;
        bool verified;
    }

    // Mapping from incident ID to Incident
    mapping(uint => Incident) public incidents;
    // Counter for generating unique incident IDs
    uint public incidentCounter;

    // Event to log new incidents
    event IncidentReported(uint id, string description, address reportedBy, uint256 timestamp);
    // Event to log incident verification
    event IncidentVerified(uint id, address verifiedBy);

    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    // Constructor to set the contract deployer as owner
    constructor() {
        owner = msg.sender;
    }

    // Function to report a new incident
    function reportIncident(string memory _description) public {
        incidentCounter++;
        incidents[incidentCounter] = Incident({
            id: incidentCounter,
            description: _description,
            reportedBy: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        emit IncidentReported(incidentCounter, _description, msg.sender, block.timestamp);
    }

    // Function to fetch incident data by ID
    function getIncident(uint _id) public view returns (uint, string memory, address, uint256, bool) {
        Incident memory incident = incidents[_id];
        return (incident.id, incident.description, incident.reportedBy, incident.timestamp, incident.verified);
    }

    // Function to mark an incident as verified (only owner can call this)
    function verifyIncident(uint _id) public onlyOwner {
        require(_id > 0 && _id <= incidentCounter, "Invalid incident ID");
        require(!incidents[_id].verified, "Incident is already verified");
        
        incidents[_id].verified = true;
        emit IncidentVerified(_id, msg.sender);
    }

    // Function to fetch the last incident's ID number
    function getLastIncidentId() public view returns (uint) {
        return incidentCounter;
    }
}