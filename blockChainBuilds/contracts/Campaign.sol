// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract CampaignFactory {
  Campaign[] public deployedCampaigns;
  
  function createCampaign(uint256 minimum) public {
    Campaign newCampaign = new Campaign(minimum, msg.sender);
    deployedCampaigns.push(newCampaign);
  }
  
   function getDeployedCampaigns() public view returns (Campaign[] memory){
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint256 approverCount;
        mapping(address => bool) approvals;
    }

    uint256 requestIndex;
    mapping(uint256 => Request) public requests;
    address public manager;
    uint public minimumContribuition;
    mapping(address => bool) public contributers;
    uint256 public contributersCount;

   constructor(uint minimum, address managerAddress) {
        manager = managerAddress;
        minimumContribuition = minimum;
    }
    
    modifier onlyManager() {
      require(msg.sender == manager, "Only manager can use");
      _;
    }

    modifier onlyContributers() {
      require(contributers[msg.sender],  "Only contributer can use");
      _;
    }

    modifier isNotApproved(Request storage request) {
      require(!request.approvals[msg.sender], "Request must not approved");
      _;
    }

    modifier onlyOngoingRequest(Request storage request) {
      require(!request.complete, "Request must not completed");
      _;
    }

    modifier finalizeCondition(Request storage request) {
      require(request.approverCount > (contributersCount/2), "50% contributers must approve to finalize this request");
      _;
    }

    function contribute() public payable {
        require(msg.value > minimumContribuition);

        contributers[msg.sender] = true;
        contributersCount++;
    }

    function createRequest(string memory description, uint value, address payable recipient) public onlyManager {
        Request storage newRequest = requests[requestIndex++];
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approverCount = 0;
    }

    function approveRequest(uint256 index) public onlyContributers isNotApproved(requests[index]) onlyOngoingRequest(requests[index]) {
      Request storage request = requests[index];
      request.approvals[msg.sender] = true;
      request.approverCount++;
    }

    function finalizeRequest(uint256 index) public payable onlyManager onlyOngoingRequest(requests[index]) finalizeCondition(requests[index]) {
      Request storage request = requests[index];
      request.recipient.transfer(request.value);
      request.complete = true;
    }
}
