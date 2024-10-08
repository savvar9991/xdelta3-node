#![deny(clippy::all)]
use napi::bindgen_prelude::Error;
use napi::bindgen_prelude::Uint8Array;
use xdelta3;

#[macro_use]
extern crate napi_derive;

pub enum XDelta3Error {
  EncodingError,
  DecodingError,
}

impl AsRef<str> for XDelta3Error {
  fn as_ref(&self) -> &str {
    match self {
      XDelta3Error::EncodingError => "ENCODING_ERROR",
      XDelta3Error::DecodingError => "DECODING_ERROR",
    }
  }
}

#[napi]
pub fn encode_sync(src: Uint8Array, dest: Uint8Array) -> Result<Uint8Array, Error<XDelta3Error>> {
  let output = xdelta3::encode(dest.to_vec().as_slice(), src.to_vec().as_slice());
  match output {
    Some(data) => {
      return Ok(Uint8Array::from(data));
    }
    None => {
      return Err(Error::new(
        XDelta3Error::EncodingError,
        "empty encoding response",
      ));
    }
  }
}

#[napi]
pub fn decode_sync(src: Uint8Array, patch: Uint8Array) -> Result<Uint8Array, Error<XDelta3Error>> {
  if patch.len() == 0 {
    return Err(Error::new(
      XDelta3Error::DecodingError,
      "invalid empty patch",
    ));
  }

  let output = xdelta3::decode(patch.to_vec().as_slice(), src.to_vec().as_slice());

  match output {
    Some(data) => {
      return Ok(Uint8Array::from(data));
    }
    None => {
      return Err(Error::new(
        XDelta3Error::DecodingError,
        "empty decoding response",
      ));
    }
  }
}
