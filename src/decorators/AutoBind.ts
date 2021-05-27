export default function AutoBind(
  _target: any,
  _property: string,
  descriptor: PropertyDescriptor
) {
  const ogMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = ogMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
