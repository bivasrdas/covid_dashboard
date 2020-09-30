import React from 'react';
import axios from 'axios';
import './speech.css'
import crossfilter from 'crossfilter2';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MicIcon from '@material-ui/icons/Mic';
const logo=require('./mic11.gif')
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;

class Speech extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state={dialog:"India",
            nlpcontent:'eg:Delhi',
            data:{},
            graph:{}
        };
        
        this.voiceCommands=this.voiceCommands.bind(this);
        this.crossdata=this.crossdata.bind(this);
        this.SpeechRecog=this.SpeechRecog.bind(this);
    }
    componentDidMount()
    {
        axios.get('https://api.covid19india.org/data.json')
        .then(res =>
            {
             console.log(res)  
             this.setState({data:res.data}) 
             console.log(this.state.data);
             //console.log("yes",this.state.td.averagedaysdelay);
            })
            .catch(error=>
                {
                    console.log(error)
                })

        axios.get('https://api.covid19india.org/states_daily.json')
        .then(res=>{
            this.setState({graph:res.data})
            console.log(res.data,"daily data")
        })
        .catch(error=>
            {
                console.log(error)
            })
   
                         
}
componentDidUpdate()
{
    this.crossdata();
} 
SpeechRecog()
{
    document.getElementById("hidden").style.display='none';
    recognition.stop();
}   
    
    voiceCommands()
    {
        var transcript;
        recognition.start()
        recognition.onstart=()=>{console.log("Voice activated");document.getElementById("hidden").style.display="block";}
        recognition.onresult=(e)=>{
        console.log("voice start",e)
        let current=e.resultIndex;
        //document.getElementById("interm").innerHTML=e.results[current][0].transcript;
        transcript=e.results[current][0].transcript;
        this.setState({nlpcontent:transcript})
        //console.log(transcript);
        recognition.onend=()=>{console.log("Voice Deactivated");this.getDialog(transcript);document.getElementById("hidden").style.display="none";this.setState({nlpcontent:""});}
        recognition.onerror=event=>{console.log(event.error)}
        }
        //console.log(transcript,"final transhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
        
    }
    getDialog(mes)
    {
        console.log(mes,"alt")
        axios.post("https://covid-dash-nlp.herokuapp.com/chat",{
            message:mes
        })
        .then(res=>
            {
                console.log(res)
                console.log(res.data.message)
                this.setState({dialog:res.data.message  });
                console.log(this.state.dialog,"dddddddddddddddddddd");
                this.crossdata(this.state.dialog);
        })
        .catch(error=>
            {console.log(error)})

            
           
    }
    crossdata()
    {
        function multivalue_filter(values){
            return function(v){
                return values.indexOf(v)!= -1;
            }
        }
        //var filterpoints=this.state.dialog;
        var filterpoints=[]
        console.log(filterpoints.length,"before")
        filterpoints=[this.state.dialog];
        console.log(filterpoints,"ddddddddddddddddddddddddddddddddddd");
        var d=this.state.data.statewise;
        var fdata=[]
        console.log(d.length)
        if(d.length!=0)
            d.map(d=>{if(d.state!='Total')
            fdata.push(d)}
            )
        console.log(fdata);
        var data1 = crossfilter(fdata);
        console.log(data1.all());
        var state=data1.dimension(d=>d.state);
        var state2=data1.dimension(d=>d.state);
        var confirmed=state.groupAll().reduceSum(d=>d.confirmed)
        console.log(confirmed.value());
        document.getElementById("confirmed").innerHTML=confirmed.value();
        var deaths=state.groupAll().reduceSum(d=>d.deaths)
        console.log(deaths.value());
        document.getElementById("deaths").innerHTML=deaths.value();
        var recovered=state.groupAll().reduceSum(d=>d.recovered)
        console.log(recovered.value());
        document.getElementById("recovered").innerHTML=recovered.value();
        var active=state.groupAll().reduceSum(d=>d.active)
        console.log(active.value());
        document.getElementById("active").innerHTML=active.value();
        console.log(filterpoints.length,"Filter points lenght");
        console.log(filterpoints)
        if(filterpoints!="")
        {
            state2.filterFunction(multivalue_filter(filterpoints));
            if(filterpoints=="India")
            state2.filterAll()
            console.log(data1.allFiltered());
            console.log(confirmed.value(),"filtered value");
            document.getElementById("confirmed").innerHTML=confirmed.value();
            document.getElementById("deaths").innerHTML=deaths.value();
            document.getElementById("recovered").innerHTML=recovered.value();
            document.getElementById("active").innerHTML=active.value();
            console.log(state.top(Infinity));   
        }
        else state2.filterAll();
        
        var t=this.state.graph.states_daily
        var plot=[];
        if(t!=undefined)
        {
            plot=crossfilter(t);
            console.log(plot.all(),"plot points")
            var status=plot.dimension(d=>d.status)
            var an=status.group().reduceSum(d=>d.an);
            console.log(an.top(1),"group by stae");
        }
        
        
        


        

    }
    
    render()
    {
        return(<div className="bodytotal">
    
    
    <div style={{color:"white",textAlign:"center",fontSize:"40px"}}>COVID DASHBOARD</div>
    <br></br>
    {/*<div style={{display:"flex",justifyContent:"center",alignItems:"center"}}><div style={{backgroundColor:"white",color:"black",borderRadius:"30px",width:"60%",fontSize:"50px",textAlign:"center",alignItems:"center"}}>{this.state.nlpcontent}</div></div>*/}
    <br></br>
    <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}><Button id="voiceb" onClick={this.voiceCommands}><div id="voicebd"styles={{ backgroundColor:"white"}} className="interact" ><MicIcon fontSize='large'></MicIcon></div></Button></div>
    <div className="name" style={{color:"white",paddingLeft:"10%", fontSize:"50px",fontWeight:"500"}}>{this.state.dialog}</div>
    <Grid  container spacing={2} style={{paddingTop:"40px"}}>
          <Grid item xs={3}>
          <div style={{textAlign:"center",color:"red",fontSize: '2.0vw'}}>Confirmed Cases<div style={{
    fontSize: '2.7vw',
    fontWeight:"400",marginTop:"10px"}}><div id="confirmed"></div></div></div>
          
        </Grid>
        <Grid item xs={3}>
          <div style={{textAlign:"center",color:"blue",fontSize: '2.0vw'}} >Active Cases<div style={{
    fontSize: '2.7vw',  
    fontWeight:"400",marginTop:"10px"}}><div id="active"></div></div></div>
        </Grid>
        <Grid item xs={3}>
          <div style={{textAlign:"center",color:"green",fontSize: '2.0vw'}}>Recovered Cases<div style={{
    fontSize: '2.7vw',
    fontWeight:"400",marginTop:"10px"}}><div id="recovered"></div></div></div>
        </Grid>
        <Grid item xs={3}>
          <div style={{textAlign:"center",color:"grey",backgroundColor:"#161625",height:"100%",fontSize: '2.0vw'}}>Deaths<div style={{
    fontSize: '2.7vw',
    fontWeight:"400",marginTop:"10px"}}><div id="deaths"></div></div></div>
        </Grid>
        </Grid>
        {/*<h2 id="interm"></h2>*/}
        <div id="hidden" style={{display:"none",backgroundColor:'rgb(26 24 26 / 1)',color:"white",position:'absolute',top:'0',height:"100%",width:"100%"}}>
            <button style={{position:"absolute",right:"0"}} onClick={this.SpeechRecog}>X</button>
            <div style={{display:"flex",justifyContent:"center",marginTop:"100px"}}><img src={logo} style={{borderRadius:"50%",border:"0px",height:"400px",width:"400px"}} ></img></div>
            <div style={{fontSize:'60px',textAlign:'center',display:"flex",justifyContent:"center",}}>{this.state.nlpcontent}</div></div>
        </div>)

    }

}
export default Speech;