import VideoBg from '../../assets/video.mp4'

const video = () => {
  return (
    <div className='video-container'>
      <video src={VideoBg} autoPlay loop muted />
    </div>
  )
}

export default video
