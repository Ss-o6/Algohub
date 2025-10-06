import React, {useState,useEffect} from "react";
import {Container, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Editor from "@monaco-editor/react";
import api from "../../api.js";
const Codeeditor=()=>{
       const [code,setcode]=useState("");
       const[language,setlanguage]=useState("cpp");
       const[input,setinput]=useState("");
       const[output,setoutput]=useState("");
       const [verdict,setverdict]=useState(null);
       const [error,seterror]=useState(null);
       const [running,setrunning]=useState(false);

       const defaultCode={
         cpp:`include <bits/stdc++.h>
         using namespace std;
         
         int main(){
           cout<<"Hello, World!"<<endl;
           return 0;
         }`,
         c:`include <stdio.h>
         
         int main(){
            printf("Hello, World!/\\n");
            return 0;
         }`,
         java:`import java.util.* 
        public class Main{
          public static void main(String[] args){
          System.out.println("Hello, World!");
          }
          }`,
          python: `print("Hello, World!")`,
          javascript: `console.log("Hello, World!");`,

       };
       useEffect(()=>{
         setcode(defaultCode[language]);
       },[language]);

       const handlerun= async()=>{
        try{
          setrunning(true);
          seterror(null);
          setverdict(null);

          const res= await api.post("/run",{code, input,language},{withCredentials:true});
          if(res.data.errortype==="compilation"){
            seterror("Compilation Error:\n"+res.data.errormessage);
            setoutput("");
          }else if( res.data.errortype==="runtime"){
            seterror("Runtime Error:\n",res.data.errormessage);
            setoutput(`Your Output :${res.data.useroutput}\n Expected Output:${res.data.expectedoutput}`);
        }else{
            seterror(null);
            setoutput(`Output:\n${res.data.output}`);
        }
        }catch(error){
            console.error("Run failed",error);
            seterror("Something went wrong while running the code.");

        }finally{
            setrunning(false);
        }
       };

       const handlesubmit=async()=>{
        try {
            setrunning(true);
            
            const res = await api.get("/submit",{language,code},{withCredentials:true});
           if(res.data.passed){
            setverdict(`✅ Passed ${response.data.passed}/${response.data.total} test cases`);
           } else {
             setverdict(`❌ Passed ${response.data.passed}/${response.data.total} test cases`);
           }
           seterror(null);
           setoutput("");

            
        } catch (error) {
            console.error("Sumission failed",error);
            seterror("Error submitting the code. Please try again");
        }finally{
            setrunning(false);
        }
       };
    return(
         <Container maxWidth="md">
            <FormControl variant="outlined" fullWidth sx={{mb:2}}>
                <InoputLabel>Language</InoputLabel>
                <Select value={language}
                        onChange={(e)=> setlanguage(e.target.value)}
                        label="Language"
                        >
                            <MenuItem value="c">C</MenuItem>
                             <MenuItem value="cpp">C++</MenuItem>
                              <MenuItem value="java">Java</MenuItem>
                               <MenuItem value="python">Python</MenuItem>
                                <MenuItem value="javascript">Javascript</MenuItem>
                        </Select>
            </FormControl>
            <Editor
              height="400px"
              language={language}
              value={code}
              onChange={(value)=> setcode(value)}
              theme="vs-dark"
              options={{
                fontSize:14,
                minimap:{enabled:false},
                scrollBeyondLastLine:false,
              }}
              />
              <Grid container spacing={2} sx={{mt:2}}>
                <Grid item xs={6}>
                    <TextField 
                    label="input"
                    multiline
                    rows={4}
                    fullWidth
                    value={input}
                    onChange={(e)=>setinput(e.target.value)}
                    />
                </Grid>
                 <Grid item xs={6}>
                    <TextField 
                    label="output"
                    multiline
                    rows={4}
                    fullWidth
                    value={output}
                    InputProps={{readOnly:true}}

                    />
                </Grid>

              </Grid>
              {verdict &&(
                <TextField
                label="verdict"
                multiline
                rows={2}
                fullWidth
                value={verdict}
                sx={{mt:2}}
                InputProps={{readOnly:true}}/>

              )}
              {error &&(
                <TextField
                label="Error"
                multiline
                rows={3}
                fullWidth
                value={error}
                sx={{mt:2, borderColor:"red"}}
                InputProps={{readOnly:true}}/>
              )}
               <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleRun}
          disabled={running}
          color="primary"
        >
          Run
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={running}
          color="success"
        >
          Submit
        </Button>
        </Box>
         </Container>
       );
};
export default Codeeditor;