
export default interface PaymentService {
	getStudentOrderDetail: (studentId: number, courseSlug: string, parentId?: number) => Promise<object>;

	onSuccessStudentParticipateCourse: (studentId: number, courseSlug: string,  orderId: string) => Promise<boolean>;
}