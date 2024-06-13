import { useEffect, useState } from "react"
import { useInterval } from "./hooks/useInterval";
import useDownloader from 'react-use-downloader';

function App() {
  const [companyInfo, setCompanyInfo] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [targetGroup, setTargetGroup] = useState("");

  const [videoId, setVideoId] = useState("");
  const [delay, setDelay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const { size, elapsed, percentage, download, cancel, error, isInProgress } = useDownloader();
  const fileName = "video.mp4";

  const generateVideo = async () => {
    const outputString = `Hi there, ${companyInfo} has built an amazing product. ${productInfo}. This product is targetted towards ${targetGroup} people. So if you fall into this category, you should definitely check it out!`;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: '746ee48b3c0121d39170d3c01757066e'
      },
      body: JSON.stringify({
        test: 'true',
        visibility: 'public',
        input: [
          {
            avatarSettings: {horizontalAlign: 'center', scale: 1, style: 'rectangular', seamless: false},
            backgroundSettings: {
              videoSettings: {
                shortBackgroundContentMatchMode: 'freeze',
                longBackgroundContentMatchMode: 'trim'
              }
            },
            scriptText: outputString,
            avatar: 'anna_costume1_cameraA',
            background: 'open_office'
          }
        ],
        title: companyInfo,
        description: productInfo,
      })
    };

    setLoading(true);
    
    await fetch('https://api.synthesia.io/v2/videos', options)
      .then(response => response.json())
      .then(response => setVideoId(response.id))
      .catch(err => {
        console.error(err)
        setLoading(false);
      });
  }

  useEffect( () => {
    if(videoId.length > 0)setDelay(10000)
  }, [videoId])

  useEffect(() => {
    if(downloadLink.length > 0){
      setDelay(null)
      setLoading(false);
    }
  }, [downloadLink])

  useInterval(async ()=> {
    const options = {
      method: 'GET',
      headers: {accept: 'application/json', Authorization: '746ee48b3c0121d39170d3c01757066e'}
    };
    
    await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, options)
      .then(response => response.json())
      .then(response => {
        if(response.status === "complete"){
          setDownloadLink(response.download);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err)
        setLoading(false);
        setDelay(null);
      });
  }, delay)

  return(
    <div className="h-screen w-screen bg-black text-white">
      <div className="flex flex-col gap-2 place-items-center pt-8">
        <div className="mb-2">
          <p className="w-96 text-start font-bold text-lg">Company Info</p>
          <p className="w-96 text-start font-light text-sm -mt-1 mb-2 text-zinc-300">Enter your company name. For example, Company ABC</p>
          <input
            className="w-96 bg-zinc-800 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Company Info"
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <p className="w-96 text-start font-bold text-lg">Product Info</p>
          <p className="w-96 text-start font-light text-sm -mt-1 mb-2 text-zinc-300">Enter your product name followed by some discription. For example, Product XYZ, it helps you with XYZ tasks</p>
          <input
            className="w-96 bg-zinc-800 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Product Info"
            value={productInfo}
            onChange={(e) => setProductInfo(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <p className="w-96 text-start font-bold text-lg">Target Group Profile</p>
          <p className="w-96 text-start font-light text-sm -mt-1 mb-2 text-zinc-300">Target Group for your product. For example, Young Adults</p>
          <input
            className="w-96 bg-zinc-800 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Please enter Target Group of your product"
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            required
          />
        </div>
        <button className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded" onClick={generateVideo}>Generate Video</button>
      </div>
      {loading && <p className="font-bold text-3xl">Your video is being generated....</p>}
      {downloadLink.length > 0 && <p className="font-bold text-3xl">You can download your video from below</p>}
      {downloadLink.length > 0 && <button className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded" onClick={() => download(downloadLink, fileName)}>Download</button>}
    </div>
  )
}

export default App
