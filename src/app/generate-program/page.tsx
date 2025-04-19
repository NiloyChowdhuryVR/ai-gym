"use client"
import { Button } from '@/components/ui/button';
import { vapi } from '@/lib/vapi';
import { useUser } from '@clerk/nextjs';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

const page = () => {
  const [callActive,setCallActive] = useState(false);
  const [connecting,setConnecting] = useState(false);
  const [isSpeaking,setIsSpeaking] = useState(false);
  const [messages,setMessages] = useState<any[]>([]);
  const [callEnded,setCallEnded] = useState(false);

  const {user} = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // auto scroll messages
  useEffect(()=>{
    if(messageContainerRef.current){
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  },[messages])

  //navigate to profile page after call ends
  useEffect(()=>{
    if(callEnded){
      const redirectTimer = setTimeout(()=>{
        router.push("/profile");

      },1500)
      return ()=>{ clearTimeout(redirectTimer)};
    } 
  },[callEnded,router])

  useEffect(()=>{
    const handleCallStart = ()=>{
      console.log("Call Stated")
      setConnecting(false)
      setCallActive(true)
      setCallEnded(false)
    }
    const handleCallEnd = ()=>{
        console.log("Call Ended");
        setConnecting(false)
        setCallActive(false)
        setIsSpeaking(false)
        setCallEnded(true)
    }
    const handleSpeechStart = ()=>{
      console.log("Ai started speaking!")
      setIsSpeaking(true)
    }
    const handleSpeechEnd = ()=>{
      console.log("Ai Stopped speaking!")
      setIsSpeaking(false)
    }
    const handleMessage = (message : any)=>{
       if(message.type === "transcript" && message.transcriptType === "final"){
        const newMessage = {content: message.transcript,role:message.role}
        setMessages(prev=>[...prev,newMessage])
       }


    }
    const handleError = (error:any)=>{
      console.log("Error on Vapi : ",error)
      setConnecting(false)
      setCallActive(false)
    }



    vapi.on("call-start",handleCallStart)
        .on("call-end",handleCallEnd)
        .on("speech-start",handleSpeechStart)
        .on("speech-end",handleSpeechEnd)
        .on("message",handleMessage)
        .on("error",handleError)

    return ()=>{
      //Just a Cleanup!!!
      vapi.off("call-start",handleCallStart)
        .off("call-end",handleCallEnd)
        .off("speech-start",handleSpeechStart)
        .off("speech-end",handleSpeechEnd)
        .off("message",handleMessage)
        .off("error",handleError)
    }

  },[])

  // const toggleCall = async()=>{
  //    if(callActive) vapi.stop()
  //     else{
  //       try {
  //         setConnecting(true);
  //         setMessages([]);
  //         setCallEnded(false)

  //         const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim(): "There";

  //         await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
  //           variableValues:{
  //             full_name: fullName
  //           }
  //         })



  //       } catch (error) {
  //         console.log("Failed to start call",error);
  //         setConnecting(false)
  //       }
  //     }
  // }

  const toggleCall = async () => {
    if (callActive) {
      console.log("Stopping call...");
      try {
        await vapi.stop(); // no need to access private `.call`
      } catch (err) {
        console.error("Error stopping call:", err);
      }
      return;
    }
  
    if (connecting || callEnded) return;
  
    try {
      setConnecting(true);
      setMessages([]);
      setCallEnded(false);
  
      const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "There";
  
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          full_name: fullName,
          user_id:user?.id,
        },
      });
    } catch (error) {
      console.log("Failed to start call", error);
      setConnecting(false);
    }
  };
  
  

  return (
    <>
      <h1>Hello ! Welcome {user?.firstName}</h1>
      <h1>{isSpeaking?"AI IS SPEAKING":null}</h1>
      <h3>{callActive?"Call Active":null}</h3>
      <h3>{callEnded?"Call Ended!!!":null}</h3>
      <h6>{connecting?"Tryping to connect...":null}</h6>
      <h6>{callEnded?"View Profile":null}</h6>
      <Button
        onClick={toggleCall}
        disabled={connecting || callEnded}
      >Start this shit</Button>

      {messages.length>0 && (
        <div ref={messageContainerRef}>
          {messages.map((msg,index)=>(
            <div key={index}>
              <h3>{msg.role === "assistant"? "Gym AI" : "You"}</h3>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      )}

       
    </>
  )
}

export default page