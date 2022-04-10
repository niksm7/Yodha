// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Operations is Ownable{

    // Variables

    uint256 public medicine_id_counter = 77;
    uint256 public service_id_counter = 88;
    uint256 public donation_id_counter = 99;
    uint256 public request_donation_id_counter = 111;

    // Structs

    struct Donor{
        string donor_id;
        string name;
        address account_address;
    }

    struct Hospital{
        string hospital_id;
        string name;
        string location; //should be encrypted
        address acct_address;
    }

    struct Patient{
        string id;
        string name;
        string age;
        string gender;
        string id_proofs; //list of ipfs hashes
        address acct_address;
    }

    struct Medicine{
        uint256 id;
        string medicine_name;
        string medicine_description;
        uint256 medicine_amount;
        string image_link;
    }

    struct Services{
        uint256 id;
        string service_name;
        string service_description;
        uint256 service_amount;
        string image_link;
    }

    struct Donation{
        uint256 id;
        address donor_address;
        address receiver_address;
        uint256 donation_amount;
    }

    struct RequestDonation{
        uint256 id;
        address requester_address;
        string hosp_id;
        uint256 coin_amount;
        uint256 total_amount;
        string donation_status;
    }

    // Arrays

    Hospital[] public all_hospitals;

    // Mappings

    mapping(string=>Donor) public id_to_donor;
    mapping(string=>Hospital) public id_to_hospital;
    mapping(string=>Patient) public id_to_patient;
    mapping(uint256=>Medicine) public id_to_medicine;
    mapping(uint256=>Services) public id_to_service;
    mapping(uint256=>Donation) public id_to_donation;
    mapping(uint256=>RequestDonation) public id_to_request_donation;

    mapping(string=>string) public user_to_pubkey;
    mapping(string=>string) public user_to_pvtkey;

    mapping(string=>uint256[]) public donor_to_donations;
    mapping(string=>uint256[]) public hosp_to_received_donations;

    mapping(string=>uint256) public hosp_to_total_donations;

    mapping(string=>uint256[]) public patient_to_requested_donations;

    mapping(string=>uint256[]) public hosp_to_requested_donations;

    mapping(uint256=>uint256[]) public requested_donations_to_medicines;
    mapping(uint256=>uint256[]) public requested_donations_to_services;

    mapping(string=>uint256[]) public hospital_to_medicines;
    mapping(string=>uint256[]) public hospital_to_services;


    function addDonor(string memory _id, string memory _name, address _acct_address, string memory _pub_key, string memory _pvt_key) public onlyOwner{
        Donor memory new_donor = Donor(_id, _name, _acct_address);
        id_to_donor[_id] = new_donor;
        user_to_pubkey[_id] = _pub_key;
        user_to_pvtkey[_id] = _pvt_key;
    }

    function addHospital(string memory _id, string memory _name, string memory _location, address _acct_address, string memory _pub_key, string memory _pvt_key) public onlyOwner{
        Hospital memory new_hospital = Hospital(_id, _name, _location, _acct_address);
        id_to_hospital[_id] = new_hospital;
        all_hospitals.push(new_hospital);
        user_to_pubkey[_id] = _pub_key;
        user_to_pvtkey[_id] = _pvt_key;
    }

    function addPatient(string memory _id, string memory _name, string memory _age, string memory _gender, string memory _id_proofs, address _acct_address, string memory _pub_key, string memory _pvt_key) public onlyOwner{
        Patient memory new_patient = Patient(_id, _name, _age, _gender, _id_proofs, _acct_address);
        id_to_patient[_id] = new_patient;
        user_to_pubkey[_id] = _pub_key;
        user_to_pvtkey[_id] = _pvt_key;
    }


    function addMedicines(string memory _hospital_id, string memory _medicine_name, string memory _medicine_desc, uint256 _amount, string memory _image_hash) public{
        // require(msg.sender == id_to_hospital[_hospital_id].acct_address, "User not allowed");
        Medicine memory new_medicine = Medicine(medicine_id_counter, _medicine_name, _medicine_desc, _amount, _image_hash);
        hospital_to_medicines[_hospital_id].push(medicine_id_counter);
        id_to_medicine[medicine_id_counter] = new_medicine;
        medicine_id_counter++;
    }


    function addServices(string memory _hospital_id, string memory _service_name, string memory _service_desc, uint256 _amount, string memory _image_hash) public{
        // require(msg.sender == id_to_hospital[_hospital_id].acct_address, "User not allowed");
        Services memory new_service = Services(service_id_counter, _service_name, _service_desc, _amount, _image_hash);
        hospital_to_services[_hospital_id].push(service_id_counter);
        id_to_service[service_id_counter] = new_service;
        service_id_counter++;
    }


    function donateAmount(string memory _donor_id, string memory _receiver_id , address _to_receiver, address _token_address, uint256 _donation_amount) public{
        IERC20 y_token = IERC20(_token_address);

        require(
            y_token.allowance(msg.sender, address(this)) >=
                _donation_amount,
            "Allowance is not enought"
        );

        require(
            y_token.transferFrom(
                msg.sender,
                address(this),
                _donation_amount
            ),
            "Something went wrong!"
        );

        Donation memory new_donation = Donation(donation_id_counter, msg.sender, _to_receiver, _donation_amount);

        id_to_donation[donation_id_counter] = new_donation;
        donor_to_donations[_donor_id].push(donation_id_counter);
        hosp_to_received_donations[_receiver_id].push(donation_id_counter);
        hosp_to_total_donations[_receiver_id] += _donation_amount;

        donation_id_counter++;

    }


    function requestDonation(string memory _patient_id, string memory _hosp_id, uint256[] memory _requested_medicines, uint256[] memory _requested_services, uint256 _coin_amount) public{
        Hospital memory hosp = id_to_hospital[_hosp_id];
        uint256 total_amount = 0;
        for (uint256 index = 0; index < _requested_medicines.length; index++) {
            total_amount += id_to_medicine[_requested_medicines[index]].medicine_amount;
        }
        for (uint256 index = 0; index < _requested_services.length; index++) {
            total_amount += id_to_service[_requested_services[index]].service_amount;
        }

        RequestDonation memory new_request = RequestDonation(request_donation_id_counter, msg.sender, _hosp_id, _coin_amount, total_amount,"Pending");

        id_to_request_donation[request_donation_id_counter] = new_request;

        patient_to_requested_donations[_patient_id].push(request_donation_id_counter);
        hosp_to_requested_donations[_hosp_id].push(request_donation_id_counter);
        requested_donations_to_medicines[request_donation_id_counter] = _requested_medicines;
        requested_donations_to_services[request_donation_id_counter] = _requested_services;

        request_donation_id_counter++;
    }


    function patientDonation(uint256 _donation_id, address _token_address) public{

        RequestDonation memory curr_donation = id_to_request_donation[_donation_id];

        require(id_to_hospital[curr_donation.hosp_id].acct_address == msg.sender, "User not allowed to perform action");

        require(hosp_to_total_donations[curr_donation.hosp_id] >= curr_donation.total_amount, "Request is higher than donation available");

        IERC20 y_token = IERC20(_token_address);

        require(
            y_token.transferFrom(
                address(this),
                curr_donation.requester_address,
                curr_donation.coin_amount
            ),
            "Something went wrong!"
        );

        curr_donation.donation_status = "Completed";

        id_to_request_donation[_donation_id] = curr_donation;

        hosp_to_total_donations[curr_donation.hosp_id] -= curr_donation.total_amount;

    }


    // Get functions

    function getAllHospitals() public view returns(Hospital[] memory){
        return all_hospitals;
    }

    function getHospitalMedicines(string memory _hospital_id) public view returns(uint256[] memory){
        return hospital_to_medicines[_hospital_id];
    }

    function getHospitalServices(string memory _hospital_id) public view returns(uint256[] memory){
        return hospital_to_services[_hospital_id];
    }

    function getHospitalRDonations(string memory _hospital_id) public view returns(uint256[] memory){
        return hosp_to_requested_donations[_hospital_id];
    }

    function getPatientRDonations(string memory _patient_id) public view returns(uint256[] memory){
        return patient_to_requested_donations[_patient_id];
    }
}