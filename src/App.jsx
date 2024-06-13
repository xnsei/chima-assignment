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

    const apiKey = import.meta.env.VITE_API_KEY;
    console.log(apiKey);
    // generating headers and body for the request
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: apiKey
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
      headers: {accept: 'application/json', Authorization: apiKey}
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
    <div className="px-8 py-8 min-h-screen w-screen bg-gray-50 text-gray-900">
    <div className="flex flex-col gap-4 items-center pt-8">
      <div className="mb-8 max-w-screen-lg flex flex-col items-center">
        <h1 className="font-semibold text-3xl md:text-5xl text-gray-800">Chima</h1>
        <h2 className="font-medium text-xl md:text-3xl text-gray-600 mt-2">Fill out the information below to generate a video</h2>
      </div>
      <div className="mb-4 w-full max-w-md">
        <label className="block text-start font-semibold text-lg text-gray-800" htmlFor="company-info">Company Info</label>
        <p className="text-start font-medium text-sm text-gray-500 mb-2">Enter your company name. For example, Rainforest</p>
        <input
          id="company-info"
          className="w-full bg-white px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Company Info"
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
          required
        />
      </div>
      <div className="mb-4 w-full max-w-md">
        <label className="block text-start font-semibold text-lg text-gray-800" htmlFor="product-info">Product Info</label>
        <p className="text-start font-medium text-sm text-gray-500 mb-2">Enter your product name followed by a description. For example, Rainforest is an AI image generation platform</p>
        <input
          id="product-info"
          className="w-full bg-white px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Product Info"
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
          required
        />
      </div>
      <div className="mb-6 w-full max-w-md">
        <label className="block text-start font-semibold text-lg text-gray-800" htmlFor="target-group">Target Group Profile</label>
        <p className="text-start font-medium text-sm text-gray-500 mb-2">Target Group for your product. For example, Young Adults or Creative people</p>
        <input
          id="target-group"
          className="w-full bg-white px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Please enter the Target Group of your product"
          value={targetGroup}
          onChange={(e) => setTargetGroup(e.target.value)}
          required
        />
      </div>
      <button
        disabled={!(companyInfo.length > 0 && productInfo.length > 0 && targetGroup.length > 0)}
        className={`px-6 py-2 rounded font-medium ${companyInfo.length > 0 && productInfo.length > 0 && targetGroup.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
        onClick={generateVideo}
      >
        Generate Video
      </button>
      {!(companyInfo.length > 0 && productInfo.length > 0 && targetGroup.length > 0) &&
        <p className="text-sm font-medium text-red-500 mt-2">Please fill in all the details first</p>
      }
    </div>
    <div className="flex flex-col items-center pt-8">
      {loading && 
        <div className="text-center">
          <p className="font-bold text-2xl md:text-3xl">Your video is being generated....</p>
          <p className="font-medium text-lg md:text-xl mt-2">Total time taken: {loadingTime} s</p>
          <p className="text-lg md:text-xl text-gray-600 mt-1">This usually takes around 3-5 minutes.</p>
        </div>
      }
      {downloadLink.length > 0 && 
        <div className="text-center">
          <p className="font-bold text-2xl md:text-3xl">You can download your video below</p>
          <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={() => download(downloadLink, fileName)}>Download</button>
        </div>
      }
    </div>
  </div>
  )
}

export default App
