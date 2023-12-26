import { useState } from "react";
import { functions } from "../firebase"
import { httpsCallable } from "firebase/functions";
import React from 'react';
import { useCookies } from 'react-cookie';

const areaStyle = {
  border: "2px solid rgb(146, 146, 221)",
  backgroundColor: "rgb(204, 204, 235)",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "100%",
  padding: "8px",
  margin: "8px auto"
};

export const SendWebhook = (props) => {
  const { completeTodos, incompleteTodos, setIncompleteTodos, setCompleteTodos} = props;
  const [headingText, setHeadingText] = useState("");
  const [heading, setHeading] = useState("#");
  const [beforeComment, setBeforeComment] = useState("");
  const [afterComment, setAfterComment] = useState("");
  const [cookies, setCookie,removeCookie] = useCookies(['WebhookUrl','incompleteTodos','completeTodos']);
  const getCookies = cookies.WebhookUrl ?? "";
  const [webhookUrl, setWebhookUrl] = useState(getCookies);

  const onChangeHeadingText = (event) => setHeadingText(event.target.value);

  const onChangeHeading = (event) => setHeading(event.target.value);

  const onChangeWebhookUrl = (event) => {
    setWebhookUrl(event.target.value);
  };

  const onChangeBeforeComment = (event) => setBeforeComment(event.target.value);

  const onChangeAfterComment = (event) => setAfterComment(event.target.value);

  const sendData = () => {
    if((completeTodos.length === 0 && incompleteTodos.length === 0) || webhookUrl.length === 0) return;
    let msg = `${beforeComment}\n${heading} ${headingText}\n`;
    completeTodos.forEach((todo) => {
      msg += `- [x] ${todo}\n`;
    });
    incompleteTodos.forEach((todo) => {
      msg += `- [ ] ${todo}\n`;
    });

    msg += `\n${afterComment}\n`;

    const callFunction = httpsCallable(functions, "sendWebhook");
    try{
      const res = callFunction({ url: webhookUrl, text: msg});
      console.log(res);
    } catch(e) {
      console.log(e);
    }
  };

  const onClickSend = async () => {
    await sendData();
  };

  const saveData = () => {
    if(webhookUrl.length > 0){
      setCookie('WebhookUrl',webhookUrl,{path: '/'});
    }
    if(incompleteTodos.length > 0){
      setCookie('incompleteTodos',incompleteTodos.join(','),{path: '/'});
    }

    if(completeTodos.length > 0){
      setCookie('completeTodos',completeTodos.join(','),{path: '/'});
    }
    alert('保存しました');
  };

  const removeData = () => {
    setHeadingText("");
    setHeading("#");
    setBeforeComment("");
    setAfterComment("");
    setWebhookUrl("");
    setIncompleteTodos([]);
    setCompleteTodos([]);
    removeCookie('WebhookUrl');
    removeCookie('incompleteTodos');
    removeCookie('completeTodos');
  };

  return (
    <div style={areaStyle}>
      <h4 className="title">Webhook</h4>
      <textarea placeholder="前書きを入力" value={beforeComment} onChange={onChangeBeforeComment} />
      <select onChange={onChangeHeading}>
        <option value="#">見出し１</option>
        <option value="##">見出し２</option>
        <option value="###">見出し３</option>
        <option value="###">見出し４</option>
      </select>
      <input
        className='input-area blue' placeholder="見出し"
        value={headingText}
        onChange={onChangeHeadingText} />
      <textarea placeholder="後書きを入力" value={afterComment} onChange={onChangeAfterComment} />
      <pre style={{ backgroundColor: "white", padding: "8px 16px", margin: "8px auto" }}>
        <p>{beforeComment}</p>
        <p>{heading} {headingText}</p>
        {completeTodos.map((todo) => (
          <p key={todo}>
            - [x] {todo}
          </p>
        ))
        }
        {incompleteTodos.map((todo) => (
          <p key={todo}>
            - [ ] {todo}
          </p>
        ))}
        <p>{afterComment}</p>
      </pre>
      <input className='input-area blue mg-left-0' placeholder='Webhookを入力' type="url"
        value={webhookUrl} onChange={onChangeWebhookUrl} />
      <button className="blue" onClick={onClickSend}>送信</button>
      <button className="blue" onClick={saveData}>データを保存</button>
      <button className="blue" onClick={removeData}>データを削除</button>
    </div>
  );
};