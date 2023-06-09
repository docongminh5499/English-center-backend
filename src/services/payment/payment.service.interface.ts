
export default interface PaymentService {
	getStudentOrderDetail: (studentId: number, courseSlug: string, parentId?: number) => Promise<object>;

	onSuccessStudentParticipateCourse: (studentId: number, courseSlug: string,  orderId: string) => Promise<boolean>;

	studentPayment: (studentId: number, courseSlug: string,  orderId: string) => Promise<boolean>;

	parentPayment: (parentId: number, studentId: number, courseSlug: string,  orderId: string) => Promise<boolean>;
}