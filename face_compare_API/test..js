var val=0;
var data={
    FaceMatches: [
       {
      Face: {
       BoundingBox: {
        Height: 0.33481481671333313, 
        Left: 0.31888890266418457, 
        Top: 0.4933333396911621, 
        Width: 0.25
       }, 
       Confidence: 99.9991226196289
      }, 
      Similarity: 100
     }
    ], 
    SourceImageFace: {
     BoundingBox: {
      Height: 0.33481481671333313, 
      Left: 0.31888890266418457, 
      Top: 0.4933333396911621, 
      Width: 0.25
     }, 
     Confidence: 99.9991226196289
    }
   }
val=data.FaceMatches.[0].Similarity;