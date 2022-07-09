import React,{useEffect,useState} from 'react';
import {Form,Input,Grid,Card,Statistic,TextArea,Label,Table,Container,Button} from 'semantic-ui-react';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";
import config from '../config';
import TextType from "../units/TextType";

function Main (props) {

  const [atoAnswerList, setAtoAnswerList] = useState([
    "hello world123",
    "helloworld123",
    "hello world",
    "helloworld",

    "HELLO WORLD123",
    "HELLOWORLD123",
    "HELLO WORLD",
    "HELLOWORD",

    "hello World123",
    "helloWorld123",
    "hello World",
    "helloWorld",
    
    "你 好123",
    "你好123",
    "你 好",
    "你好",

    "------------------------",

    "helloworld",
    "hello world",    
    "HELLOWORLD",
    "HELLO WORLD",
    "HelloWorld",
    "Hello World",
    "hello World 123",
    "helloworld1",
    "helloworld!",
    "hello world",
    "Hello World",
    "Helloണ്ടെWorld",
    "Hello哈喽World",
    "hello哈喽world",
    "Hello-World",
    "Hel3lo Wor2ld",
    "hello world!",
    "HELLO WORLD!",
    "HELLO WORLD",
    "HELLOWORLD",
    "我们都是",
    "我们都是123",
    "我们都是hello",
    "123",
    "1 2 3",
    "123一二三",
    "123一二三one",
    "一二三123one",
    "Pont d'Iéna",
    "   ",
    " ",
    "H U K",
    "",
    "123Hello world456"
    ]);

  function getAnswerFormat(inAnswer){
    var a="";
    if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_ASCII)){
      if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE)){
        if(/^[0-9 ]+$/.test(inAnswer)){          
          if(/^[ ]+$/.test(inAnswer)){
            a="all spaces";
          }
          else{
            a="all numbers (0-9)";  
          }
        }
        else{
          a="all lowercase english letters (a-z)";  
        }
      }
      else if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE)){
        a="all uppercase english letters (A-Z)";
      }
      else{
        a="all english letters (a-z A-Z)";
      }
    }
    else{
      a="contains symbol/punctuation/non-english characters";
    }

    var b="";
    if(/\d/.test(inAnswer)){
      b="contains numbers (0-9)";
    }
    else{
      b="not contain numbers (0-9)"; 
    }

    var c="";
    if(TextType.isType(inAnswer,TextType.TEXT_TYPE.HAS_SPACE) && !TextType.isType(inAnswer,TextType.TEXT_TYPE.NO_SPACE)){
      //c="contains spaces";
    }
    else if(!TextType.isType(inAnswer,TextType.TEXT_TYPE.HAS_SPACE) && TextType.isType(inAnswer,TextType.TEXT_TYPE.NO_SPACE)){
      //c="not contain spaces";
    }
    else{
      //return false;
    }
    if(/\s/.test(inAnswer)){
      b="contains spaces";
    }
    else{
      b="not contain spaces"; 
    }


    var d="";
    if(a=="all numbers (0-9)"){
      d=a+", "+c;    
    }
    else{
      d=a+", "+b+", "+c;
    }    
    return d;
  }

  function getAnswerFormat2(inAnswer){
    const patternM=new RegExp(/^[a-zA-Z0-9 ]+$/);
    const patternL=new RegExp(/^[a-z]+$/);
    const patternU=new RegExp(/^[A-Z]+$/);

    if(patternM.test(inAnswer)){
      if(patternL.test(inAnswer)){
        return("Lower");
      }
      else if(patternU.test(inAnswer)){
        return("Upper");
      }
      else{
        return("Mixed");  
      }      
      
    }
    else{
      return("Other");
    }
  }

  function getAnswerFormat3(inAnswer){
    if(inAnswer==""){
      return("blank");
    }
    else if(/^[0-9 ]+$/.test(inAnswer)){      
      if(/^[0-9]+$/.test(inAnswer)){
        return("all numbers");
      }
      else{
        if(/^[ ]+$/.test(inAnswer)){
          return("all spaces");
        }
        else{
          return("all numbers and spaces");
        }
      }
    }
    else{
      if(/^[a-zA-Z0-9 ]+$/.test(inAnswer)){
        if(/^[a-z0-9 ]+$/.test(inAnswer)){
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all lowercase english letters, contains numbers, contains spaces");     
            }
            else{
              return("all lowercase english letters, contains numbers, not contain spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all lowercase english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all lowercase english letters, not contain numbers, not contain spaces");
            }
          }
        }
        else if(/^[A-Z0-9 ]+$/.test(inAnswer)){
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all uppercase english letters, contains numbers, contains spaces");     
            }
            else{
              return("all uppercase english letters, contains numbers, not contains spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all uppercase english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all uppercase english letters, not contain numbers, not contain spaces");
            }
          }
        } 
        else{
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all english letters, contains numbers, contains spaces");     
            }
            else{
              return("all english letters, contains numbers, not contains spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all english letters, not contain numbers, not contain spaces");
            }
          }
        }       
      }
      else{
        if(/\d/.test(inAnswer)){
          if(/\s/.test(inAnswer)){
            return("contains symbol/punctuation/non-english characters, contains numbers, contains spaces");     
          }
          else{
            return("contains symbol/punctuation/non-english characters, contains numbers, not contain spaces");
          }
        }
        else{
          if(/\s/.test(inAnswer)){
            return("contains symbol/punctuation/non-english characters, not contain numbers, contains spaces");     
          }
          else{
            return("contains symbol/punctuation/non-english characters, not contain numbers, not contain spaces");
          }
        }
      }      
    }
  }

  useEffect(() => {

  });

  return (
    <div>
      <h1>Dev test</h1>
      <ul>
        {atoAnswerList.map((item, idx)=><li key={idx}>
          <strong>{item}</strong> - {getAnswerFormat3(item)}
        </li>)}
      </ul>
    </div>
  );
}

export default function DevTest (props) {
  return <Main {...props} />;
}