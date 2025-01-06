import { useSelector } from 'store';

export default function Render(props) {
  const renderedImage = useSelector((state) => state.info?.renderedImage);
  // const cannyImage = useSelector((state) => state.info?.cannyImage);

  return (
    <div {...props}>
      {/* {cannyImage && (
          <>
            <img
              className="w-full h-1/2"
              src={
                cannyImage.includes('data:')
                  ? cannyImage
                  : `data:image/jpeg;base64,${cannyImage}`
              }
              alt="Canny"
            />
          </>
        )} */}
      {renderedImage && (
        <img
          className="w-full h-full"
          src={
            renderedImage.includes('data:')
              ? renderedImage
              : `data:image/jpeg;base64,${renderedImage}`
          }
          alt="Render"
        />
      )}
    </div>
  );
}
