#include <napi.h>
#include <dlfcn.h>
#include "leitor.h"

Napi::Object ReadingToJsObject(Napi::Env env, const Reading& reading) {
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("erro", Napi::Number::New(env, reading.erro));
  obj.Set("id_prova", Napi::Number::New(env, reading.id_prova));
  obj.Set("id_participante", Napi::Number::New(env, reading.id_participante));
  obj.Set("leitura", Napi::String::New(env, reading.leitura));

  return obj;
}

Napi::Value GetReading(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Esperado uma string").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string path = info[0].As<Napi::String>().Utf8Value();

  const char* StringPath = path.c_str();

  Reading reading = read_image_path(StringPath);

  return ReadingToJsObject(env, reading);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("GetReading", Napi::Function::New(env, GetReading));
  return exports;
}

NODE_API_MODULE(reading, Init)