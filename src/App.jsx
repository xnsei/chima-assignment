import { useEffect, useState } from "react"
import useDownloader from 'react-use-downloader';
import { useInterval } from "./hooks/useInterval";

function App() {
  // state variables for all the user inputs
  const [companyInfo, setCompanyInfo] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [targetGroup, setTargetGroup] = useState("");

  // state variables to store video id, video download link, etc.
  const [videoId, setVideoId] = useState("");
  const [delay, setDelay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [loadingTime, setLoadingTime] = useState(1);

  // download function from the useDownloader hook
  const { download } = useDownloader();
  const fileName = "video.mp4";


  // function to send initial video generation request
  const generateVideo = async () => {
    // generate script for the video
    // TODO: Consider using OpenAI API for script generation
    const videoScript = `Hi there, ${companyInfo} has built an amazing product. ${productInfo}. ${companyInfo} is targetted towards ${targetGroup}. So if you feel excited, definitely give it a try!`;

    // generating headers and body for the request
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
            scriptText: videoScript,
            avatar: 'anna_costume1_cameraA',
            background: 'open_office'
          }
        ],
        title: companyInfo,
        description: productInfo,
      })
    };

    setLoading(true);

    // send initial video generation request
    await fetch('https://api.synthesia.io/v2/videos', options)
      .then(response => response.json())
      .then(response => setVideoId(response.id))
      .catch(err => {
        console.error(err)
        setLoading(false);
      });
  }

  // polling is in progress when delay is not null
  // start polling when videoId is set
  useEffect( () => {
    if(videoId.length > 0)setDelay(10000)
  }, [videoId])

  // stop polling when downloadLink is set
  useEffect(() => {
    if(downloadLink.length > 0){
      setDelay(null)
      setLoading(false);
    }
  }, [downloadLink])

  // polling for video status using custom useInterval hook
  useInterval(async ()=> {
    const options = {
      method: 'GET',
      headers: {accept: 'application/json', Authorization: '746ee48b3c0121d39170d3c01757066e'}
    };
    
    // send polling request to check video status
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

  useInterval (() => setLoadingTime(loadingTime + 1), loading ? 1000 : null)

  return(
    <div className="px-8 py-8 h-screen w-screen bg-zinc-50 text-black">
      <div className="flex flex-col gap-2 place-items-center pt-8">
        <div className="mb-8 max-w-screen-lg flex flex-col place-items-center">
          <h1 className="font-medium text-2xl md:text-4xl">Chima</h1>
          <h2 className="font-medium text-lg md: text-2xl">Fill out some information below to generate video</h2>
        </div>
        <div className="mb-2">
          <p className="w-72 md:w-96 text-start font-bold text-lg">Company Info</p>
          <p className="w-72 md:w-96 text-start font-medium text-sm -mt-1 mb-2 text-zinc-600">Enter your company name. For example, Rainforest</p>
          <input
            className="w-72 md:w-96 bg-zinc-100 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Company Info"
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            required={true}
          />
        </div>
        <div className="mb-2">
          <p className="w-72 md:w-96 text-start font-bold text-lg">Product Info</p>
          <p className="w-72 md:w-96 text-start font-medium text-sm -mt-1 mb-2 text-zinc-600">Enter your product name followed by some discription. For example, Rainforest is an AI image generation platform</p>
          <input
            className="w-72 md:w-96 bg-zinc-100 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Product Info"
            value={productInfo}
            onChange={(e) => setProductInfo(e.target.value)}
            required={true}
          />
        </div>
        <div className="mb-2">
          <p className="w-72 md:w-96 text-start font-bold text-lg">Target Group Profile</p>
          <p className="w-72 md:w-96 text-start font-medium text-sm -mt-1 mb-2 text-zinc-600">Target Group for your product. For example, Young Adults or Creative people</p>
          <input
            className="w-72 md:w-96 bg-zinc-100 px-4 py-2 rounded border border-zinc-600"
            type="text"
            placeholder="Please enter Target Group of your product"
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            required={true}
          />
        </div>
        <button 
          disabled={(companyInfo.length > 0 && productInfo.length > 0 && targetGroup.length > 0) ? false : true} 
          className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded" 
          onClick={generateVideo}
        >
            Generate Video
        </button>
        {!(companyInfo.length > 0 && productInfo.length > 0 && targetGroup.length > 0) &&
          <p className="text-sm font-medium">Please fill in the details first</p>
        }
      </div>
      <div className="flex flex-col gap-2 place-items-center pt-8 place-items-center">
        {loading && 
          <div>
            <p className="font-bold text-xl md:text-3xl">Your video is being generated....</p>
            <p className="font-bold text-lg md:text-xl">Total time taken: {loadingTime} s</p>
            <p className="text-lg md:text-xl">This usually takes around 3-5 minutes.</p>
          </div>
        }
        {downloadLink.length > 0 && 
          <div>
            <p className="font-bold text-xl md:text-3xl">You can download your video from below</p>
            <button className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded" onClick={() => download(downloadLink, fileName)}>Download</button>
          </div>
        }
      </div>
    </div>
  )
}

export default App
