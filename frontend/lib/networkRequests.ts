import toast from "react-hot-toast";

async function requestTokens(publicKey: string) {
  const request = fetch('/api/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey: publicKey
    })
  });
  toast.promise(request, {
    loading: 'Requesting Token Transfer',
    success: 'Successfully Transferred',
    error: 'Error while transferring'
  })
  const response = await request;
  const data = await response.json();
  return data;
}

export { requestTokens };