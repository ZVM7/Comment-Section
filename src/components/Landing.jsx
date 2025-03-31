import React, { useState, useEffect } from 'react';

const timeAgo = (timestamp) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else {
    return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
  }
};

const Landing = ({ data }) => {
  const [text, setText] = useState('');
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments');
    return savedComments ? JSON.parse(savedComments) : [];
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [dataComments, setDataComments] = useState([]);
  const [sortedComments, setSortedComments] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyVisible, setReplyVisible] = useState(null);

  useEffect(() => {
    if (data && data.comments) {
      const initialComments = data.comments.map(comment => ({
        ...comment,
        replies: [] 
      }));
      setDataComments(initialComments);
      setSortedComments(initialComments);
    }
  }, [data]);

  const handleCommentVote = (commentIndex, voteType) => {
    const updatedComments = [...sortedComments];
    const comment = updatedComments[commentIndex];

    if (comment) {
      if (voteType === 'up') {
        comment.score += 1;
      } else if (voteType === 'down') {
        comment.score -= 1;
      }
      updatedComments.sort((a, b) => b.score - a.score);
      setSortedComments(updatedComments);
      setDataComments(updatedComments);
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };

  const handleReplyButtonClick = (commentIndex) => {
    setReplyVisible(replyVisible === commentIndex ? null : commentIndex);
  };

  const handleReplySubmit = (parentIndex) => {
    if (!replyText.trim()) return;
    const newReply = {
      user: {
        username: 'Anonymous',
        image: { png: 'default_image.png' },
      },
      content: replyText,
      score: 0,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      votes: 0,
    };

    const updatedComments = [...sortedComments];
    updatedComments[parentIndex].replies = [...(updatedComments[parentIndex].replies || []), newReply]
      .sort((a, b) => b.votes - a.votes); // Sort replies after adding new one
    
    setSortedComments(updatedComments);
    setDataComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
    
    setReplyText('');
    setReplyVisible(null);
  };

  const handleSendClick = () => {
    if (text.trim()) {
      const currentDate = new Date();
      const newComment = {
        text,
        timestamp: currentDate.toISOString(),
        votes: 0,
        score: 0,
        replies: [],
      };

      let updatedComments = [...comments];
      if (editingIndex !== null) {
        updatedComments[editingIndex] = { ...updatedComments[editingIndex], text: editedText };
      } else {
        updatedComments.push(newComment);
      }

      updatedComments.sort((a, b) => b.votes - a.votes);
      setComments(updatedComments);
      localStorage.setItem('comments', JSON.stringify(updatedComments));

      setText('');
      setEditedText('');
      setEditingIndex(null);
    }
  };

  const handleDeleteClick = (timestamp, parentIndex = null) => {
    if (parentIndex === null) {
      const filteredComments = comments.filter((comment) => comment.timestamp !== timestamp);
      setComments(filteredComments);
      const filteredSortedComments = sortedComments.filter((comment) => comment.timestamp !== timestamp);
      setSortedComments(filteredSortedComments);
      setDataComments(filteredSortedComments);
      localStorage.setItem('comments', JSON.stringify(filteredSortedComments));
    } else {
      const updatedComments = [...sortedComments];
      updatedComments[parentIndex].replies = updatedComments[parentIndex].replies
        .filter(reply => reply.timestamp !== timestamp)
        .sort((a, b) => b.votes - a.votes);
      setSortedComments(updatedComments);
      setDataComments(updatedComments);
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };

  const handleEditClick = (index, parentIndex = null) => {
    if (parentIndex === null) {
      const commentToEdit = comments[index];
      setEditingIndex(index);
      setEditedText(commentToEdit.text);
    } else {
      const replyToEdit = sortedComments[parentIndex].replies[index];
      setEditingIndex(`${parentIndex}-${index}`);
      setEditedText(replyToEdit.content);
    }
  };

  const handleUpdateClick = () => {
    if (editedText.trim()) {
      if (typeof editingIndex === 'string') {
        const [parentIndex, replyIndex] = editingIndex.split('-').map(Number);
        const updatedComments = [...sortedComments];
        updatedComments[parentIndex].replies[replyIndex].content = editedText;
        updatedComments[parentIndex].replies.sort((a, b) => b.votes - a.votes);
        setSortedComments(updatedComments);
        setDataComments(updatedComments);
        localStorage.setItem('comments', JSON.stringify(updatedComments));
      } else if (editingIndex !== null) {
        const updatedComments = [...comments];
        updatedComments[editingIndex] = {
          ...updatedComments[editingIndex],
          text: editedText,
        };
        updatedComments.sort((a, b) => b.votes - a.votes);
        setComments(updatedComments);
        localStorage.setItem('comments', JSON.stringify(updatedComments));
      }
      setEditingIndex(null);
      setEditedText('');
    }
  };

  const handleVote = (index, voteType, parentIndex = null) => {
    if (parentIndex !== null) {
      const updatedComments = [...sortedComments];
      const reply = updatedComments[parentIndex].replies[index];
      if (voteType === 'up') {
        reply.votes += 1;
      } else if (voteType === 'down') {
        reply.votes -= 1;
      }
      updatedComments[parentIndex].replies.sort((a, b) => b.votes - a.votes); // Sort replies after voting
      setSortedComments(updatedComments);
      setDataComments(updatedComments);
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    } else {
      const updatedComments = [...comments];
      if (voteType === 'up') {
        updatedComments[index].votes += 1;
      } else if (voteType === 'down') {
        updatedComments[index].votes -= 1;
      }
      updatedComments.sort((a, b) => b.votes - a.votes);
      setComments(updatedComments);
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };

  return (
    <>
      <div style={{ margin: '0 auto', width: '73%' }}>
        {sortedComments.map((comment, index) => (
          <div key={index}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: 'white',
                flexWrap: 'wrap',
                height: '141px',
                padding: '10px',
                borderRadius: '8px',
                width: '77%',
                marginLeft: '100px',
                marginBottom: '20px',
                border: '1px solid #ddd',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {comment.user && comment.user.image && (
                <img
                  src={comment.user.image.png}
                  alt={comment.user.username}
                  style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '36px',
                    left: '65px',
                    marginTop: '-20px',
                  }}
                />
              )}

              <h1 style={{ fontSize: '14px', fontWeight: 'bold',  position: 'absolute',
                        left: '120px', }}>
                {comment.user ? comment.user.username : 'Anonymous'}
              </h1>

              <p
                style={{
                    marginLeft: '14px',
                    marginTop: '10px',
                    position: 'absolute',
                    top: '40px',
                    left: '52px',
                    fontSize: '14px',
                    textAlign: 'start',
                    lineHeight: '1.5',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'auto',
                    maxWidth: 'calc(100% - 50px)',
                    maxHeight: '100px',
                    textOverflow: 'ellipsis',
                }}
              >
                {comment.content || 'No content available'}
              </p>

              <span
                style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '5px',
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    left: '210px',
                    top: '16px',
                }}
              >
                {comment.createdAt}
              </span>

              <span
                style={{
                  color: '#0039b0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginLeft: '45px',
                  marginTop: '5px',
                  position: 'absolute',
                  left: '400px',
                  top: '17px',
                }}
                onClick={() => handleReplyButtonClick(index)}
              >
                <img style={{ width: '9px', marginRight: '10px' }} src="src/images/icon-reply.svg" alt="reply" />
                Reply
              </span>

              <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '5px',
                    backgroundColor: '#e9effa',
                    padding: '10px',
                    borderRadius: '8px',
                    position: 'absolute',
                    left: '14px',
                    boxSizing: 'border-box',
                    height: '72px',
                }}
              >
                <button
                  onClick={() => handleCommentVote(index, 'up')}
                  style={{
                    fontSize: '12px',
                    backgroundColor: '#e9effa',
                    color: 'grey',
                    padding: '5px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  +
                </button>

                <span
                  className="voten"
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    margin: '5px 0',
                    color: '#1858cc',
                  }}
                >
                  {comment.score}
                </span>

                <button
                  onClick={() => handleCommentVote(index, 'down')}
                  style={{
                    fontSize: '12px',
                    color: 'grey',
                    backgroundColor: '#e9effa',
                    padding: '5px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  -
                </button>
              </div>
            </div>

            {replyVisible === index && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'white',
                  flexDirection: 'column',
                  padding: '10px',
                  borderRadius: '8px',
                  width: '77%',
                  margin: '0 auto',
                  marginTop: '20px',
                  position: 'relative',
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src="src/assets/images/avatars/image-juliusomo.png"
                  alt="avatar"
                  style={{
                    width: '5%',
                    position: 'absolute',
                    top: '30px',
                    left: '17px',
                  }}
                />
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add a reply..."
                  style={{
                    alignSelf: 'center',
                    borderRadius: '10px',
                    resize: 'none',
                    width: '70%',
                    height: '100px',
                    marginTop: '20px',
                    marginLeft: '-70px',
                    fontSize: '25px',
                    paddingLeft: '25px',
                    marginBottom: '20px',
                  }}
                />
                <a
                  href="#"
                  onClick={() => handleReplySubmit(index)}
                  style={{
                    position: 'absolute',
                    top: '30px',
                    right: '23px',
                    backgroundColor: '#4269b1',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '8%',
                    height: '20%',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  REPLY
                </a>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginLeft: '130px', marginTop: '10px' }}>
                {comment.replies.map((reply, replyIndex) => (
                  <div
                    key={replyIndex}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      backgroundColor: 'white',
                      padding: '10px',
                      borderRadius: '8px',
                      width: '82%',
                      height: '141px',
                      textAlign: 'center',
                      marginBottom: '20px',
                      marginLeft:'28px',
                      border: '1px solid #ddd',
                      position: 'relative',
                    }}
                  >
                    <img
                      src='src\assets\images\avatars\image-juliusomo.png'
                      alt={reply.user.username}
                      style={{
                        width: '25px',
                        height: '25px',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '36px',
                        left: '55px',
                        marginTop: '-20px',
                      }}
                    />
                    <h1
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        left: '90px',
                      }}
                    >
                      juliusomo
                    </h1>

                    <h1
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#4269b1',
                        color: 'white',
                        height: '5%',
                        position: 'absolute',
                        top: '12px',
                        left: '180px',
                        fontWeight: 'bold',
                        lineHeight: '0.3',
                        padding: '4px 9px',
                      }}
                    >
                      you
                    </h1>

                    <div
                      style={{
                        display: 'flex',
                        gap: '40px',
                        marginTop: '5px',
                        position: 'absolute',
                        left: '400px',
                        top: '17px',
                      }}
                    >
                      <span
                        onClick={() => handleDeleteClick(reply.timestamp, index)}
                        style={{
                          color: '#e52121',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        <img
                          style={{ width: '9px', marginRight: '10px' }}
                          src="src/assets/images/icon-delete.svg"
                          alt="delete"
                        />
                        Delete
                      </span>
                      <span
                        onClick={() => handleEditClick(replyIndex, index)}
                        style={{
                          color: '#0f3cbf',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        <img
                          style={{ width: '9px', marginRight: '10px' }}
                          src="src/assets/images/icon-edit.svg"
                          alt="edit"
                        />
                        Edit
                      </span>
                      {editingIndex === `${index}-${replyIndex}` && (
                        <button
                          onClick={handleUpdateClick}
                          style={{
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            position: 'absolute',
                            border: 'none',
                            top: '110px',
                            left: '90px',
                            height: '25px',
                            width: '55px',
                            backgroundColor: '#4269b1',
                            borderRadius: '8px',
                          }}
                        >
                          UPDATE
                        </button>
                      )}
                    </div>

                    {editingIndex === `${index}-${replyIndex}` ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        style={{
                          width: '87%',
                          position: 'absolute',
                          top: '55px',
                          left: '55px',
                          height: '70px',
                          fontSize: '14px',
                          borderRadius: '10px',
                          padding: '10px',
                          resize: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <p
                        style={{
                          marginLeft: '14px',
                          marginTop: '10px',
                          position: 'absolute',
                          top: '40px',
                          left: '45px',
                          fontSize: '14px',
                          textAlign: 'start',
                          lineHeight: '1.5',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          overflow: 'auto',
                          maxWidth: 'calc(100% - 50px)',
                          maxHeight: '100px',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {reply.content || ''}
                      </p>
                    )}

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '5px',
                        whiteSpace: 'nowrap',
                        position: 'absolute',
                        left: '235px',
                        top: '16px',
                      }}
                    >
                      {timeAgo(reply.timestamp)}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '5px',
                        backgroundColor: '#e9effa',
                        padding: '10px',
                        borderRadius: '8px',
                        position: 'absolute',
                        left: '14px',
                        boxSizing: 'border-box',
                        height: '72px',
                      }}
                    >
                      <button
                        onClick={() => handleVote(replyIndex, 'up', index)}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#e9effa',
                          color: 'grey',
                          padding: '5px',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        +
                      </button>

                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          margin: '5px 0',
                          color: '#1858cc',
                        }}
                      >
                        {reply.votes}
                      </span>

                      <button
                        onClick={() => handleVote(replyIndex, 'down', index)}
                        style={{
                          fontSize: '12px',
                          color: 'grey',
                          backgroundColor: '#e9effa',
                          padding: '5px',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '20px',
            }}
          >
            {comments.map((comment, index) =>
              comment && comment.text ? (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    width: '77%',
                    height: '141px',
                    textAlign: 'center',
                    marginLeft: '100px',
                    marginBottom: '20px',
                    border: '1px solid #ddd',
                    position: 'relative',
                  }}
                >
                  <img
                    src="src/assets/images/avatars/image-juliusomo.png"
                    alt="avatar"
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '36px',
                      left: '55px',
                      marginTop: '-20px',
                    }}
                  />
                  <h1
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      position: 'absolute',
                      left: '90px',
                    }}
                  >
                    juliusomo
                  </h1>

                  <h1
                    style={{
                      fontSize: '12px',
                      backgroundColor: '#4269b1',
                      color: 'white',
                      height: '5%',
                      position: 'absolute',
                      top: '12px',
                      left: '160px',
                      fontWeight: 'bold',
                      lineHeight: '0.3',
                      padding: '4px 9px',
                    }}
                  >
                    you
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      gap: '40px',
                      marginTop: '5px',
                      position: 'absolute',
                      left: '400px',
                      top: '17px',
                    }}
                  >
                    <span
                      onClick={() => handleDeleteClick(comment.timestamp)}
                      style={{
                        color: '#e52121',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      <img style={{ width: '9px', marginRight: '10px' }} src="src/assets/images/icon-delete.svg" alt="delete" />
                      Delete
                    </span>
                    <span
                      onClick={() => handleEditClick(index)}
                      style={{
                        color: '#0f3cbf',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      <img style={{ width: '9px', marginRight: '10px' }} src="src/assets/images/icon-edit.svg" alt="edit" />
                      Edit
                    </span>
                    {editingIndex === index && (
                      <button
                        onClick={handleUpdateClick}
                        style={{
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          position: 'absolute',
                          border: 'none',
                          top: '110px',
                          left: '90px',
                          height: '25px',
                          width: '55px',
                          backgroundColor: '#4269b1',
                          borderRadius: '8px',
                        }}
                      >
                        UPDATE
                      </button>
                    )}
                  </div>

                  {editingIndex === index ? (
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      style={{
                        width: '87%',
                        position: 'absolute',
                        top: '55px',
                        left: '55px',
                        height: '70px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        padding: '10px',
                        resize: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        marginLeft: '14px',
                        marginTop: '10px',
                        position: 'absolute',
                        top: '40px',
                        left: '42px',
                        fontSize: '14px',
                        textAlign: 'start',
                        lineHeight: '1.5',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        overflow: 'auto',
                        maxWidth: 'calc(100% - 50px)',
                        maxHeight: '100px',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {comment.text || ''}
                    </p>
                  )}

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#888',
                      marginTop: '5px',
                      whiteSpace: 'nowrap',
                      position: 'absolute',
                      left: '210px',
                      top: '16px',
                    }}
                  >
                    {timeAgo(comment.timestamp)}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: '5px',
                      backgroundColor: '#e9effa',
                      padding: '10px',
                      borderRadius: '8px',
                      position: 'absolute',
                      left: '14px',
                      boxSizing: 'border-box',
                      height: '72px',
                    }}
                  >
                    <button
                      onClick={() => handleVote(index, 'up')}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#e9effa',
                        color: 'grey',
                        padding: '5px',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      +
                    </button>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        margin: '5px 0',
                        color: '#1858cc',
                      }}
                    >
                      {comment.votes}
                    </span>

                    <button
                      onClick={() => handleVote(index, 'down')}
                      style={{
                        fontSize: '12px',
                        color: 'grey',
                        backgroundColor: '#e9effa',
                        padding: '5px',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      -
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'white',
              flexDirection: 'column',
              padding: '10px',
              borderRadius: '8px',
              width: '77%',
              margin: '0 auto',
              position: 'sticky',
              bottom: 0,
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src="src/assets/images/avatars/image-juliusomo.png"
              alt="avatar"
              style={{
                width: '5%',
                position: 'absolute',
                top: '30px',
                left: '17px',
              }}
            />
            <a
              href="#"
              onClick={handleSendClick}
              style={{
                position: 'absolute',
                top: '30px',
                right: '23px',
                backgroundColor: '#4269b1',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '8%',
                height: '20%',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              SEND
            </a>

            <textarea
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                alignSelf: 'center',
                borderRadius: '10px',
                resize: 'none',
                width: '70%',
                height: '100px',
                marginTop: '20px',
                marginLeft: '-70px',
                fontSize: '25px',
                paddingLeft: '25px',
                marginBottom: '20px',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;