import React, { useEffect, useState,Component} from 'react';
import { useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import "./auth.css";
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import SuccessModal from '../../shared/components/UIElements/Success';
import GroupDetail from './groupdetail';

const  JoinGroupAuth = ()=>{
   const {sendRequest} = useHttpClient();
   const [isLoading, setIsLoading] = useState(false);
   const [success, setSuccess] = useState();
   const [error, setError] = useState();
 
    const [name,setName]=useState("");
    const [marketplace,setMarketplace]=useState("");
    const [price,setPrice]=useState("");
    const [unitsPurchase,setUnitspurchase]=useState("");
    const [targetPrice,setTragetprice]=useState("");
    const [details,setDetails]=useState("");
    const [duration,setDuration]=useState("");
    const gid = useParams().gid;
    
    const onSubmitform = async e =>{
        e.preventDefault();
        try{   
            setIsLoading(true);
            var userid = localStorage.getItem('__react_session__');
            userid = await JSON.parse(userid)
            userid = userid['userid']
            var body={"name":name,"price":price,"unitsPurchase":unitsPurchase,"targetPrice":targetPrice,"details":details,"duration":duration};
            body = JSON.stringify(body)
            const responseData = await sendRequest(
                `https://stool-back.herokuapp.com/api/source/add/${gid}/${userid}`,"POST",body,{
                    'Content-Type': 'application/json'
            }
              );
              if(responseData['status']!=200 && responseData['status']!=202){
                throw responseData.error;
            }
              console.log(responseData)
            setSuccess(responseData.data.message || 'Something went wrong, please try again.');
            setIsLoading(false);
            setError(false);
            //window.location="/";
        }catch(err){
            setIsLoading(false);
            setSuccess(err.message || 'Something went wrong, please try again.');
        }
    }
    const successHandler = () => {
        setSuccess(null);
        setError(null);
      };
    const letlev = async e =>{
        // e.preventDefault();
        try{
        setIsLoading(true)
        var userid = localStorage.getItem('__react_session__');
        userid = await JSON.parse(userid)
        userid = userid['userid']
        var body={"groupId":gid};
        console.log(body)
        body = JSON.stringify(body)
        const responseData = await sendRequest(
            `https://stool-back.herokuapp.com/api/groups/remove/${userid}/`,"POST",body,{
                'Content-Type': 'application/json'}
        );
        setIsLoading(false)
        SuccessModal(responseData.data.message);
    }catch(error){
        setIsLoading(false);
        setSuccess(error.message || 'Something went wrong, please try again.');

    }
    }

    
    return (   
        <React.Fragment>
        <SuccessModal error={success} onClear={successHandler} />
        {isLoading && <LoadingSpinner asOverlay />}
        <GroupDetail/>
    <div className="group_form_div">
		<center>
            <button className="leave_group_btn" button  onClick={() => letlev()}>
                Leave Group
            </button>
            <NavLink className="request_btns" to={`/requestsource/${gid}`}>Request/Add Source</NavLink>
            <NavLink className="request_btns" to={`/transferownership/${gid}`}>Group Details</NavLink>
        </center>
    </div>
    </React.Fragment>
    );
  
};

export default JoinGroupAuth;